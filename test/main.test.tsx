import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TAppProps } from '../src/main.js';

const BOOT_OUTPUT =
  'Connessione al mainframe di Zion stabilita. Digita "help" per la lista dei comandi.';

const HELP_OUTPUT =
  'Comandi disponibili:\n- help: Mostra la lista dei comandi disponibili\n- knock: Mostra sul display il testo "Knock, knock, Neo..."\n- matrix: Avvia la sequenza Matrix con pioggia di codice binario\n- whoami: Risponde "Tu sei l\'Eletto"';

const KNOCK_OUTPUT = 'Knock, knock, Neo...';

const MATRIX_OUTPUT =
  'Avvio sequenza Matrix: pioggia di codice binario in corso...';

const WHOAMI_OUTPUT = "Tu sei l'Eletto";

type TExpectedOverlayState = {
  readonly coverage: string;
  readonly delay: string;
  readonly fullCoverage: string;
  readonly speed: string;
};

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

const mountApp = async (): Promise<HTMLElement> => {
  const rootElement = document.createElement('div');
  rootElement.id = 'root';
  document.body.append(rootElement);

  await act(async () => {
    await import('../src/main.js');
  });

  return rootElement;
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

describe('main entry point', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
    document.body.replaceChildren();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false);
    document.body.replaceChildren();
  });

  it('mounts App into #root with black screen typewriter styling and reveals boot message over time', async () => {
    const rootElement = await mountApp();

    const { App } = await import('../src/main.js');
    const expectedTitle = "Terminale dell'Operatore \u{2014} Zion";

    const mainElement = rootElement.querySelector('main');
    expect(mainElement?.className).toContain('bg-black');
    expect(mainElement?.className).toContain('font-mono');
    expect(mainElement?.className).toContain('text-green-400');

    expect(rootElement.querySelector('h1')?.textContent).toBe(expectedTitle);

    const bootEntry = rootElement.querySelector('[data-entry-id="boot"]');
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

    act(() => {
      vi.advanceTimersByTime((BOOT_OUTPUT.length - 2) * 15);
    });
    expect(visibleSpan?.textContent).toBe(BOOT_OUTPUT);
    expect(pendingSpan?.textContent).toBe('');
    expect(
      bootEntry?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();

    const props: TAppProps = { title: 'Zion Core' };
    expect(props.title).toBe('Zion Core');
    expect(typeof App).toBe('function');
  });

  it('executes "help" command and displays available command list', async () => {
    const rootElement = await mountApp();

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(rootElement, 'help');
    });

    const entryTwo = rootElement.querySelector('[data-entry-id="2"]');
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
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
  });

  it('executes "knock" command and displays exact message "Knock, knock, Neo..."', async () => {
    const rootElement = await mountApp();

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(rootElement, 'knock');
    });

    const entryTwo = rootElement.querySelector('[data-entry-id="2"]');
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
    expect(visibleSpan?.textContent).toBe('Knock, knock, Neo...');
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();
    expect(
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
  });

  it('executes "whoami" command and responds with exact message "Tu sei l\'Eletto"', async () => {
    const rootElement = await mountApp();

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(rootElement, 'whoami');
    });

    const entryTwo = rootElement.querySelector('[data-entry-id="2"]');
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
    expect(visibleSpan?.textContent).toBe("Tu sei l'Eletto");
    expect(
      entryTwo?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();
    expect(
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
  });

  it('executes "matrix" command, accelerates rain progression to full coverage and closes on button click', async () => {
    const rootElement = await mountApp();

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    expect(
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();

    act(() => {
      submitCommand(rootElement, 'matrix');
    });

    const entryTwo = rootElement.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ matrix'
    );

    const overlay = rootElement.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay).not.toBeNull();
    if (overlay === null) {
      return;
    }

    assertOverlayState(overlay, {
      coverage: '20',
      delay: '180',
      fullCoverage: 'false',
      speed: '1',
    });

    const columns = rootElement.querySelectorAll(
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
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
  });

  it('executes unknown command and displays diagnostic message in terminal', async () => {
    const rootElement = await mountApp();

    act(() => {
      vi.advanceTimersByTime(BOOT_OUTPUT.length * 15);
    });

    act(() => {
      submitCommand(rootElement, 'operator-status');
    });

    const entryTwo = rootElement.querySelector('[data-entry-id="2"]');
    expect(entryTwo).not.toBeNull();
    expect(entryTwo?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ operator-status'
    );

    const expectedUnknownOutput =
      'Comando non riconosciuto: "operator-status". Digita "help" per la lista dei comandi disponibili.';

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
      rootElement.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
  });

  it('ignores whitespace or empty command submission', async () => {
    const rootElement = await mountApp();

    const log = rootElement.querySelector('[data-testid="terminal-log"]');
    expect(log?.children).toHaveLength(1);

    act(() => {
      submitCommand(rootElement, ' '.repeat(3));
    });
    expect(log?.children).toHaveLength(1);
  });

  it('does not mount when #root is absent from the document', async () => {
    await act(async () => {
      await import('../src/main.js');
    });

    expect(document.body.children).toHaveLength(0);
  });
});
