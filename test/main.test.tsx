import { act } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TAppProps } from '../src/main.js';

describe('main entry point', () => {
  beforeEach(() => {
    vi.resetModules();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
    document.body.replaceChildren();
  });

  it('mounts App into #root when present and exposes App and TAppProps', async () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.append(rootElement);

    await act(async () => {
      await import('../src/main.js');
    });
    const { App } = await import('../src/main.js');

    expect(document.querySelector('#root > main > h1')?.textContent).toBe(
      'repo-vite-react-base'
    );
    const props: TAppProps = { title: 'repo-vite-react-base' };
    expect(renderToStaticMarkup(<App title={props.title} />)).toBe(
      '<main><h1>repo-vite-react-base</h1></main>'
    );
  });

  it('does not mount when #root is absent from the document', async () => {
    await act(async () => {
      await import('../src/main.js');
    });

    expect(document.body.children).toHaveLength(0);
  });
});
