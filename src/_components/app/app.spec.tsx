import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  TerminalConsole,
  TTerminalConsoleProps,
} from './_components/terminal-console/index.js';

import { App } from './app.component.js';

type TConsoleCapture = {
  latestOnSubmitCommand?: (rawCommand: string) => void;
};

const capture: TConsoleCapture = {};

vi.mock('./_components/terminal-console/index.js', async (importOriginal) => {
  const actual = await importOriginal<{
    readonly TerminalConsole: typeof TerminalConsole;
  }>();
  return {
    ...actual,
    TerminalConsole: (props: TTerminalConsoleProps) => {
      capture.latestOnSubmitCommand = props.onSubmitCommand;
      return actual.TerminalConsole(props);
    },
  };
});

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

describe('App', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders custom title when provided and non-empty', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App title="  Mainframe Zion  " />);
    });

    const heading = container.querySelector('h1');
    expect(heading?.textContent).toBe('Mainframe Zion');

    act(() => {
      root.unmount();
    });
  });

  it('renders default title and boot message when title is omitted or blank', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    const defaultTitle = "Terminale dell'Operatore \u{2014} Zion";
    const heading = container.querySelector('h1');
    expect(heading?.textContent).toBe(defaultTitle);

    const bootEntry = container.querySelector('[data-entry-id="boot"]');
    expect(bootEntry).not.toBeNull();
    expect(bootEntry?.textContent).toBe(
      'Connessione al mainframe di Zion stabilita. Digita "help" per la lista dei comandi.'
    );

    act(() => {
      root.render(<App title="   " />);
    });
    expect(container.querySelector('h1')?.textContent).toBe(defaultTitle);

    act(() => {
      root.render(<App title="" />);
    });
    expect(container.querySelector('h1')?.textContent).toBe(defaultTitle);

    act(() => {
      root.unmount();
    });
  });

  it('submits non-matrix command, adds it to the log and leaves matrix overlay inactive', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    act(() => {
      submitCommand(container, 'knock');
    });

    const log = container.querySelector('[data-testid="terminal-log"]');
    expect(log?.textContent).toContain('knock');

    const entryTwo = container.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();

    const overlay = container.querySelector(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('submits single-character non-matrix command and adds entry', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    act(() => {
      submitCommand(container, 'q');
    });

    const entryTwo = container.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.textContent).toContain('q');

    act(() => {
      root.unmount();
    });
  });

  it('does not add entry to log when submitting whitespace or empty command', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    const log = container.querySelector('[data-testid="terminal-log"]');
    expect(log?.children).toHaveLength(1);

    act(() => {
      submitCommand(container, ' '.repeat(3));
    });
    expect(log?.children).toHaveLength(1);

    act(() => {
      capture.latestOnSubmitCommand?.(' '.repeat(3));
    });
    expect(log?.children).toHaveLength(1);

    act(() => {
      root.unmount();
    });
  });

  it('activates matrix overlay on "matrix" command and deactivates when close button is clicked', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      submitCommand(container, 'matrix');
    });

    const overlay = container.querySelector(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay).not.toBeNull();

    const closeButton = overlay?.querySelector('button');
    expect(closeButton).not.toBeNull();

    act(() => {
      closeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      root.unmount();
    });
  });
});
