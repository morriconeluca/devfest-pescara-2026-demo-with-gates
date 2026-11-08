import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TAppProps } from '../src/main.js';

const submitCommand = (container: HTMLElement, command: string): void => {
  const input = container.querySelector<HTMLInputElement>(
    'input[aria-label="Comando terminale"]'
  );
  const form = container.querySelector('form');
  if (input === null || form === null) {
    return;
  }

  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  );
  const setter: unknown =
    descriptor === undefined ? undefined : Reflect.get(descriptor, 'set');
  if (typeof setter === 'function') {
    Reflect.apply(setter, input, [command]);
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
};

describe('main entry point', () => {
  beforeEach(() => {
    vi.resetModules();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
    document.body.replaceChildren();
  });

  it('mounts App into #root when present, displaying operator title and boot message', async () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.append(rootElement);

    await act(async () => {
      await import('../src/main.js');
    });

    const { App } = await import('../src/main.js');
    const expectedTitle = "Terminale dell'Operatore \u{2014} Zion";

    expect(document.querySelector('#root h1')?.textContent).toBe(expectedTitle);

    const bootEntry = document.querySelector('[data-entry-id="boot"]');
    expect(bootEntry).not.toBeNull();
    expect(bootEntry?.textContent).toBe(
      'Connessione al mainframe di Zion stabilita. Digita "help" per la lista dei comandi.'
    );

    const props: TAppProps = { title: 'Zion Core' };
    expect(props.title).toBe('Zion Core');
    expect(typeof App).toBe('function');
  });

  it('supports commands and matrix overlay interaction through mounted app', async () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.append(rootElement);

    await act(async () => {
      await import('../src/main.js');
    });

    const log = rootElement.querySelector('[data-testid="terminal-log"]');
    expect(log?.children).toHaveLength(1);

    act(() => {
      submitCommand(rootElement, ' '.repeat(3));
    });
    expect(log?.children).toHaveLength(1);

    act(() => {
      submitCommand(rootElement, 'knock');
    });
    expect(log?.textContent).toContain('knock');
    expect(
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      submitCommand(rootElement, 'matrix');
    });
    const overlay = rootElement.querySelector(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay).not.toBeNull();

    const closeButton = overlay?.querySelector('button');
    act(() => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
  });

  it('does not mount when #root is absent from the document', async () => {
    await act(async () => {
      await import('../src/main.js');
    });

    expect(document.body.children).toHaveLength(0);
  });
});
