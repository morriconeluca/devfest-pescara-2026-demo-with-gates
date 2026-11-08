import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  TerminalConsole,
  TTerminalConsoleProps,
} from './_components/terminal-console/index.js';

import { App } from './app.component.js';

const BOOT_OUTPUT =
  'Connessione al mainframe di Zion stabilita. Digita "help" per la lista dei comandi.';

const HELP_OUTPUT =
  'Comandi disponibili:\n- help: Mostra la lista dei comandi disponibili\n- knock: Mostra sul display il testo "Knock, knock, Neo..."\n- matrix: Avvia la sequenza Matrix con pioggia di codice binario\n- whoami: Risponde "Tu sei l\'Eletto"';

const KNOCK_OUTPUT = 'Knock, knock, Neo...';

const MATRIX_OUTPUT =
  'Avvio sequenza Matrix: pioggia di codice binario in corso...';

const WHOAMI_OUTPUT = "Tu sei l'Eletto";

type TConsoleCapture = {
  latestOnSubmitCommand?: (rawCommand: string) => void;
};

type TExpectedOverlayState = {
  readonly coverage: string;
  readonly delay: string;
  readonly fullCoverage: string;
  readonly speed: string;
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

const assertOverlayState = (
  overlay: HTMLElement,
  expected: TExpectedOverlayState
): void => {
  expect(overlay.dataset['coverage']).toBe(expected.coverage);
  expect(overlay.dataset['speed']).toBe(expected.speed);
  expect(overlay.dataset['fullCoverage']).toBe(expected.fullCoverage);
  expect(overlay.dataset['delay']).toBe(expected.delay);
};

const advanceAndAssertOverlay = (
  overlay: HTMLElement,
  advanceMs: number,
  expected: TExpectedOverlayState
): void => {
  act(() => {
    vi.advanceTimersByTime(advanceMs);
  });
  assertOverlayState(overlay, expected);
};

describe('App', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false);
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
    expect(bootEntry?.textContent).toBe(BOOT_OUTPUT);

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

  it('renders black screen terminal with phosphor green styling and reveals system response progressively via typewriter', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    const mainElement = container.querySelector('main');
    expect(mainElement?.className).toContain('bg-black');
    expect(mainElement?.className).toContain('font-mono');
    expect(mainElement?.className).toContain('text-green-400');

    const bootEntry = container.querySelector('[data-entry-id="boot"]');
    expect(bootEntry).not.toBeNull();

    const visibleSpan = bootEntry?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const pendingSpan = bootEntry?.querySelector(
      '[data-testid="typewriter-pending"]'
    );
    const cursor = bootEntry?.querySelector(
      '[data-testid="typewriter-cursor"]'
    );

    expect(visibleSpan?.textContent).toBe('');
    expect(pendingSpan?.textContent).toBe(BOOT_OUTPUT);
    expect(cursor).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(visibleSpan?.textContent).toBe(BOOT_OUTPUT.slice(0, 1));
    expect(pendingSpan?.textContent).toBe(BOOT_OUTPUT.slice(1));
    expect(
      bootEntry?.querySelector('[data-testid="typewriter-cursor"]')
    ).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(visibleSpan?.textContent).toBe(BOOT_OUTPUT.slice(0, 2));
    expect(pendingSpan?.textContent).toBe(BOOT_OUTPUT.slice(2));
    expect(
      bootEntry?.querySelector('[data-testid="typewriter-cursor"]')
    ).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime((BOOT_OUTPUT.length - 2) * 15);
    });
    expect(visibleSpan?.textContent).toBe(BOOT_OUTPUT);
    expect(pendingSpan?.textContent).toBe('');
    expect(
      bootEntry?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('executes "help" command, reveals available commands list and leaves matrix inactive', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(container, 'help');
    });

    const entryTwo = container.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ help'
    );

    const visibleSpan = entryTwo?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    expect(visibleSpan?.textContent).toBe('');
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(HELP_OUTPUT.length * 15);
    });

    expect(visibleSpan?.textContent).toBe(HELP_OUTPUT);
    expect(visibleSpan?.textContent).toContain('help');
    expect(visibleSpan?.textContent).toContain('matrix');
    expect(visibleSpan?.textContent).toContain('knock');
    expect(visibleSpan?.textContent).toContain('whoami');
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();

    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('executes "knock" command and displays exact message "Knock, knock, Neo..."', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(container, 'knock');
    });

    const entryTwo = container.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ knock'
    );

    act(() => {
      vi.advanceTimersByTime(KNOCK_OUTPUT.length * 15);
    });

    const visibleSpan = entryTwo?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    expect(visibleSpan?.textContent).toBe(KNOCK_OUTPUT);
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('executes "whoami" command and responds with exact message "Tu sei l\'Eletto"', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(container, 'whoami');
    });

    const entryTwo = container.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ whoami'
    );

    act(() => {
      vi.advanceTimersByTime(WHOAMI_OUTPUT.length * 15);
    });

    const visibleSpan = entryTwo?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    expect(visibleSpan?.textContent).toBe(WHOAMI_OUTPUT);
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('executes "matrix" command, initiates binary rain effect, accelerates coverage step by step and closes on button click', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      submitCommand(container, 'matrix');
    });

    const entryTwo = container.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ matrix'
    );

    const overlay = container.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay).not.toBeNull();
    if (overlay === null) {
      act(() => {
        root.unmount();
      });
      return;
    }

    assertOverlayState(overlay, {
      coverage: '20',
      delay: '180',
      fullCoverage: 'false',
      speed: '1',
    });

    const columns = container.querySelectorAll(
      '[data-testid="matrix-rain-column"]'
    );
    expect(columns).toHaveLength(20);
    for (const column of columns) {
      expect(column.children).toHaveLength(4);
      expect(column.textContent).toMatch(/^[01]+$/);
    }

    advanceAndAssertOverlay(overlay, 180, {
      coverage: '40',
      delay: '150',
      fullCoverage: 'false',
      speed: '2',
    });
    advanceAndAssertOverlay(overlay, 150, {
      coverage: '60',
      delay: '120',
      fullCoverage: 'false',
      speed: '3',
    });
    advanceAndAssertOverlay(overlay, 120, {
      coverage: '80',
      delay: '90',
      fullCoverage: 'false',
      speed: '4',
    });
    advanceAndAssertOverlay(overlay, 90, {
      coverage: '100',
      delay: '60',
      fullCoverage: 'true',
      speed: '5',
    });
    advanceAndAssertOverlay(overlay, 60, {
      coverage: '100',
      delay: '30',
      fullCoverage: 'true',
      speed: '6',
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const visibleSpan = entryTwo?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    expect(visibleSpan?.textContent).toBe(MATRIX_OUTPUT);
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();

    const closeButton = overlay.querySelector('button');
    expect(closeButton).not.toBeNull();
    expect(closeButton?.textContent).toBe('Esci da Matrix');

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

  it('executes unknown command and displays diagnostic message in terminal', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<App />);
    });

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(container, 'access-mainframe');
    });

    const entryTwo = container.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ access-mainframe'
    );

    const expectedUnknownOutput =
      'Comando non riconosciuto: "access-mainframe". Digita "help" per la lista dei comandi disponibili.';

    act(() => {
      vi.advanceTimersByTime(expectedUnknownOutput.length * 15);
    });

    const visibleSpan = entryTwo?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    expect(visibleSpan?.textContent).toBe(expectedUnknownOutput);
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

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
});
