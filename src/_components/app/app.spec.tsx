import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { App } from './app.component.js';

describe('App', () => {
  it('renders the trimmed application title when non-empty', () => {
    expect(renderToStaticMarkup(<App title="  my-app  " />)).toBe(
      '<main><h1>my-app</h1></main>'
    );
  });

  it('renders the default title when the configured title is blank', () => {
    expect(renderToStaticMarkup(<App title="  " />)).toBe(
      '<main><h1>default</h1></main>'
    );
    expect(renderToStaticMarkup(<App title="" />)).toBe(
      '<main><h1>default</h1></main>'
    );
  });
});
