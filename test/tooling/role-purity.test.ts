import { ESLint } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import eslintConfig from '../../eslint.config.js';

const fixtureRoot = path.resolve(
  import.meta.dirname,
  '../../src/_role-purity-fixture'
);

const eslint = new ESLint({
  ignore: false,
  overrideConfig: [
    ...eslintConfig,
    {
      rules: {
        'faf/conformity': 'off',
      },
    },
  ],
  overrideConfigFile: true,
});

const writeFixture = (relativePath: string, content: string): string => {
  const fullPath = path.join(fixtureRoot, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  return fullPath;
};

const lint = async (
  relativePath: string,
  content: string
): Promise<readonly string[]> => {
  const fullPath = writeFixture(relativePath, content);
  const results = await eslint.lintFiles([fullPath]);
  return (results[0]?.messages ?? [])
    .map((message) => message.ruleId)
    .filter((ruleId): ruleId is string => typeof ruleId === 'string');
};

const restricted = (ruleIds: readonly string[]): readonly string[] =>
  ruleIds.filter((ruleId) => ruleId.startsWith('no-restricted-'));

describe('role purity', () => {
  beforeAll(async () => {
    await eslint.lintFiles(['src/main.tsx']);
  }, 120_000);

  afterAll(() => {
    fs.rmSync(fixtureRoot, { force: true, recursive: true });
  });

  it('rejects node:fs in a util', async () => {
    const errors = restricted(
      await lint(
        'read.util.ts',
        "import fs from 'node:fs';\nexport const read = (): string => fs.readFileSync('x', 'utf8');\n"
      )
    );
    expect(errors).toContain('no-restricted-imports');
  });

  it('rejects fs in a util', async () => {
    const errors = restricted(
      await lint(
        'read-fs.util.ts',
        "import fs from 'fs';\nexport const read = (): string => fs.readFileSync('x', 'utf8');\n"
      )
    );
    expect(errors).toContain('no-restricted-imports');
  });

  it('rejects node:worker_threads in a util', async () => {
    const errors = restricted(
      await lint(
        'worker.util.ts',
        "import { Worker } from 'node:worker_threads';\nexport const createWorker = (): Worker => new Worker('x');\n"
      )
    );
    expect(errors).toContain('no-restricted-imports');
  });

  it('rejects worker_threads in a util', async () => {
    const errors = restricted(
      await lint(
        'worker-bare.util.ts',
        "import { Worker } from 'worker_threads';\nexport const createWorker = (): Worker => new Worker('x');\n"
      )
    );
    expect(errors).toContain('no-restricted-imports');
  });

  it('rejects node:child_process in a util', async () => {
    const errors = restricted(
      await lint(
        'spawn.util.ts',
        "import { spawnSync } from 'node:child_process';\nexport const run = (): number => spawnSync('true').status ?? 0;\n"
      )
    );
    expect(errors).toContain('no-restricted-imports');
  });

  it('rejects child_process in a util', async () => {
    const errors = restricted(
      await lint(
        'spawn-bare.util.ts',
        "import { spawnSync } from 'child_process';\nexport const run = (): number => spawnSync('true').status ?? 0;\n"
      )
    );
    expect(errors).toContain('no-restricted-imports');
  });

  it('rejects oxc-resolver in a util', async () => {
    const errors = restricted(
      await lint(
        'resolve.util.ts',
        "import { ResolverFactory } from 'oxc-resolver';\nexport const createResolver = (): ResolverFactory => new ResolverFactory({});\n"
      )
    );
    expect(errors).toContain('no-restricted-imports');
  });

  it('rejects the process global in a util', async () => {
    const errors = restricted(
      await lint('pid.util.ts', 'export const pid = process.pid;\n')
    );
    expect(errors).toContain('no-restricted-globals');
    expect(errors).toContain('no-restricted-properties');
  });

  it('allows a pure util with no effect import', async () => {
    const errors = restricted(
      await lint(
        'add.util.ts',
        'export const add = (left: number, right: number): number => left + right;\n'
      )
    );
    expect(errors).toEqual([]);
  });

  it('allows node:fs in a spec', async () => {
    const errors = restricted(
      await lint(
        'read.spec.ts',
        "import fs from 'node:fs';\nexport const read = (): string => fs.readFileSync('x', 'utf8');\n"
      )
    );
    expect(errors).toEqual([]);
  });
});
