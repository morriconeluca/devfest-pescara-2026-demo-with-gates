# repo-vite-react-base

Base **Vite.js + React 19 + React Compiler + TypeScript** development environment governed by the **Fractal Architecture Framework (FAF)** and `@morriconeluca/eslint-plugin-faf`, with strict static analysis (including React, React Hooks / React Compiler, React Refresh, and JSX a11y rules), unit and integration testing, mutation testing, and Vite production build gates.

---

## Requirements

- **Node.js**: `>= 24.0.0` (required for native TypeScript type stripping)

---

## Repository Structure

```text
index.html                                   Application HTML entry point
vite.config.ts                               Vite + React + React Compiler configuration
src/                                         Root Fragment
  main.css                                   Root Node (global stylesheet)
  main.tsx                                   Public Root Node (application entry point)
  _components/app/                           Private Category Fragment (component)
    app.type.ts                              Fragment Node (type)
    app.component.tsx                        Master Node
    index.ts                                 Access Node
    app.spec.tsx                             Unit test (Sub-Graph Node)
test/
  main.test.tsx                              Entry-point integration test
  fitness/dependency-graph.test.ts           Reachability, cycle, and dist import checks
  support/test-temp-dir.ts                   Isolated per-process temporary directory setup
  tooling/                                   Repository convention and gate tooling tests
scripts/                                     Check and mutation runner scripts and ESLint rules
fafconfig.ts                                 FAF architectural configuration
eslint.config.ts                             ESLint flat configuration
```

---

## Architectural Configuration (`fafconfig.ts`)

`fafconfig.ts` declares the repository's Fractal Tree and Role catalog verified by `@morriconeluca/eslint-plugin-faf`:

- **Origin**: `rootFragments: [{ path: 'src', rootNodes: [['main.css'], ['main.tsx']] }]`
- **Public Surface**: `publicRootNodes: ['src/main.tsx']`
- **Roles (`style` < `constant` < `schema` < `type` < `mock` < `config` < `util` < `store` < `context` < `hook` < `component` < `layout` < `page` < `route`)**:
  - Rank 0 — `style` (`_styles`, implicit `.css` extension, multiple Symbols)
  - Rank 1 — `constant` (`_constants`, Category Node, multiple Symbols)
  - Rank 2 — `schema` (`_schemas`, Fragment)
  - Rank 3 — `type` (`_types`, Category Node or Fragment Node, multiple Symbols)
  - Rank 4 — `mock` (`_mocks`, Category Node, multiple Symbols)
  - Rank 5 — `config` (`_configs`, Category Node, multiple Symbols)
  - Rank 6 — `util` (`_utils`, Fragment)
  - Rank 7 — `store` (`_stores`, Fragment)
  - Rank 8 — `context` (`_contexts`, Fragment)
  - Rank 9 — `hook` (`_hooks`, Fragment)
  - Rank 10 — `component` (`_components`, Fragment)
  - Rank 11 — `layout` (`_layouts`, Fragment)
  - Rank 12 — `page` (`_pages`, Fragment)
  - Rank 13 — `route` (`_routes`, Fragment)
- **Sub-Graph Roles**: `spec` (`*.spec.{ts,tsx}`)
- **Atomic Design Horizontal Hierarchy**: `[['_atoms'], ['_molecules'], ['_organisms'], ['_templates']]`
- **Systemic Design Horizontal Hierarchy**: `[['_primitives'], ['_compounds'], ['_aggregates'], ['_systems'], ['_ecosystems']]`

---

## Quality Gates

Every change is verified through five sequential quality gates:

1. **`gate:1`** (`npm run gate:1`): Prettier formatting check and TypeScript type checking (`tsc --noEmit`).
2. **`gate:2`** (`npm run gate:2`): ESLint across the entire repository, including `faf/conformity` (`@morriconeluca/eslint-plugin-faf`), strict type-checked rules, React / React Hooks (React Compiler) / React Refresh / JSX a11y strict rules, functional restrictions, JSDoc enforcement on `*.type.ts`, and custom repository rules.
3. **`gate:3`** (`npm run gate:3`): Vitest unit, integration, and dependency-graph fitness tests with v8 coverage (**≥ 95% lines** and **≥ 90% branches** per file).
4. **`gate:4`** (`npm run gate:4:diff`, `npm run gate:4:incremental`, `npm run gate:4:force`): Stryker mutation testing with independent plan verification and **≥ 80% mutation score** per file.
5. **`gate:5`** (`npm run gate:5`): Vite production bundle verification (`vite build`) with React Compiler (`babel-plugin-react-compiler`).

---

## Common Commands

```bash
# Start Vite development server
npm run dev

# Fast incremental verification (tsc, eslint on changed .ts/.tsx files, fitness, vitest related)
npm run check

# Full CI pipeline (gate:1 + gate:2 + gate:3 + gate:4:diff + gate:5)
npm run ci

# Centralized incremental mutation run
npm run gate:4:incremental

# Full forced mutation run
npm run gate:4:force

# Auto-fix ESLint and Prettier formatting
npm run sanitize

# Typecheck and build Vite production bundle
npm run build
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the complete architectural rules, placement criteria, coding conventions, testing requirements, and quality gate specifications.

---

## License

MIT © [Luca Morricone](https://github.com/morriconeluca)
