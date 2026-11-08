import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TTerminalEntry } from './terminal-console.type.js';

import { TerminalConsole } from './terminal-console.component.js';

const assignInputValue = (input: HTMLInputElement, value: string): void => {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  );
  const setter: unknown =
    descriptor === undefined ? undefined : Reflect.get(descriptor, 'set');
  if (typeof setter === 'function') {
    Reflect.apply(setter, input, [value]);
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('TerminalConsole', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', false);
    container.remove();
  });

  it('renders historical log entries with and without command lines', () => {
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'boot-1',
        output: 'System initialized.',
      },
      {
        command: 'status',
        id: 'cmd-2',
        output: 'All systems operational.',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    const log = container.querySelector('[data-testid="terminal-log"]');
    expect(log).not.toBeNull();

    const bootEntry = container.querySelector('[data-entry-id="boot-1"]');
    expect(bootEntry?.textContent).toBe('System initialized.');

    const commandEntry = container.querySelector('[data-entry-id="cmd-2"]');
    expect(commandEntry?.textContent).toContain('zion@operator:~$ status');
    expect(commandEntry?.textContent).toContain('All systems operational.');

    act(() => {
      root.unmount();
    });
  });

  it('renders command prompt only when entry command is provided', () => {
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'without-cmd',
        output: 'No command here.',
      },
      {
        command: 'diag',
        id: 'with-cmd',
        output: 'Diagnostics ready.',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    const withoutCommand = container.querySelector(
      '[data-entry-id="without-cmd"]'
    );
    const withCommand = container.querySelector('[data-entry-id="with-cmd"]');

    expect(withoutCommand?.querySelector('p.text-green-300')).toBeNull();
    expect(withCommand?.querySelector('p.text-green-300')?.textContent).toBe(
      'zion@operator:~$ diag'
    );

    act(() => {
      root.unmount();
    });
  });

  it('renders operator prompt and submit button in command form', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<TerminalConsole entries={[]} onSubmitCommand={vi.fn()} />);
    });

    const form = container.querySelector('form');
    expect(form?.textContent).toContain('zion@operator:~$');

    const button = container.querySelector('button[type="submit"]');
    expect(button?.textContent).toBe('Invia');

    act(() => {
      root.unmount();
    });
  });

  it('updates input value on change', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<TerminalConsole entries={[]} onSubmitCommand={vi.fn()} />);
    });

    const input = container.querySelector<HTMLInputElement>(
      'input[aria-label="Comando terminale"]'
    );
    expect(input).not.toBeNull();
    if (input === null) {
      return;
    }

    act(() => {
      assignInputValue(input, 'ping zion');
    });

    expect(input.value).toBe('ping zion');

    act(() => {
      root.unmount();
    });
  });

  it('submits valid command, calls onSubmitCommand with input value and clears input', () => {
    const handleSubmit = vi.fn();
    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={[]} onSubmitCommand={handleSubmit} />
      );
    });

    const input = container.querySelector<HTMLInputElement>(
      'input[aria-label="Comando terminale"]'
    );
    const form = container.querySelector('form');
    expect(input).not.toBeNull();
    expect(form).not.toBeNull();
    if (input === null || form === null) {
      return;
    }

    act(() => {
      assignInputValue(input, 'matrix');
    });

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      form.dispatchEvent(submitEvent);
    });

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('matrix');
    expect(input.value).toBe('');

    act(() => {
      root.unmount();
    });
  });

  it('submits single-character command and invokes onSubmitCommand', () => {
    const handleSubmit = vi.fn();
    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={[]} onSubmitCommand={handleSubmit} />
      );
    });

    const input = container.querySelector<HTMLInputElement>(
      'input[aria-label="Comando terminale"]'
    );
    const form = container.querySelector('form');
    expect(input).not.toBeNull();
    expect(form).not.toBeNull();
    if (input === null || form === null) {
      return;
    }

    act(() => {
      assignInputValue(input, 'x');
    });

    act(() => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith('x');
    expect(input.value).toBe('');

    act(() => {
      root.unmount();
    });
  });

  it('does not invoke onSubmitCommand when submitting empty or whitespace command', () => {
    const handleSubmit = vi.fn();
    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={[]} onSubmitCommand={handleSubmit} />
      );
    });

    const input = container.querySelector<HTMLInputElement>(
      'input[aria-label="Comando terminale"]'
    );
    const form = container.querySelector('form');
    expect(input).not.toBeNull();
    expect(form).not.toBeNull();
    if (input === null || form === null) {
      return;
    }

    act(() => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    });
    expect(handleSubmit).not.toHaveBeenCalled();

    act(() => {
      assignInputValue(input, ' '.repeat(3));
    });

    act(() => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    });
    expect(handleSubmit).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it('renders initial typewriter state with empty visible portion and active cursor', () => {
    vi.useFakeTimers();
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'initial-entry',
        output: 'Matrix initialized.',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    const visibleSpan = container.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const pendingSpan = container.querySelector(
      '[data-testid="typewriter-pending"]'
    );
    const cursor = container.querySelector('[data-testid="typewriter-cursor"]');

    expect(visibleSpan?.textContent).toBe('');
    expect(pendingSpan?.textContent).toBe('Matrix initialized.');
    expect(cursor).not.toBeNull();

    const entryElement = container.querySelector(
      '[data-entry-id="initial-entry"]'
    );
    expect(entryElement?.textContent).toBe('Matrix initialized.');

    act(() => {
      root.unmount();
    });
  });

  it('progressively advances visible characters at 15ms interval steps', () => {
    vi.useFakeTimers();
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'step-entry',
        output: 'abc',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    const visibleSpan = container.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const pendingSpan = container.querySelector(
      '[data-testid="typewriter-pending"]'
    );

    act(() => {
      vi.advanceTimersByTime(14);
    });
    expect(visibleSpan?.textContent).toBe('');
    expect(pendingSpan?.textContent).toBe('abc');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(visibleSpan?.textContent).toBe('a');
    expect(pendingSpan?.textContent).toBe('bc');
    expect(
      container.querySelector('[data-testid="typewriter-cursor"]')
    ).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(visibleSpan?.textContent).toBe('ab');
    expect(pendingSpan?.textContent).toBe('c');
    expect(
      container.querySelector('[data-testid="typewriter-cursor"]')
    ).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(visibleSpan?.textContent).toBe('abc');
    expect(pendingSpan?.textContent).toBe('');
    expect(
      container.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('completes typing, clears pending portion, removes cursor and halts timer updates', () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'done-entry',
        output: 'Done.',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    act(() => {
      vi.advanceTimersByTime(15 * 6);
    });

    const visibleSpan = container.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const pendingSpan = container.querySelector(
      '[data-testid="typewriter-pending"]'
    );
    const cursor = container.querySelector('[data-testid="typewriter-cursor"]');

    expect(visibleSpan?.textContent).toBe('Done.');
    expect(pendingSpan?.textContent).toBe('');
    expect(cursor).toBeNull();
    expect(clearIntervalSpy).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(visibleSpan?.textContent).toBe('Done.');
    expect(pendingSpan?.textContent).toBe('');

    act(() => {
      root.unmount();
    });
  });

  it('starts typing sequence when a new entry is appended to existing entries', () => {
    vi.useFakeTimers();
    const entryOne: TTerminalEntry = {
      id: 'entry-1',
      output: 'First.',
    };
    const entryTwo: TTerminalEntry = {
      id: 'entry-2',
      output: 'Second.',
    };

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={[entryOne]} onSubmitCommand={vi.fn()} />
      );
    });

    act(() => {
      vi.advanceTimersByTime(15 * 6);
    });

    const entryOneElement = container.querySelector(
      '[data-entry-id="entry-1"]'
    );
    const entryOneVisible = entryOneElement?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const entryOneCursor = entryOneElement?.querySelector(
      '[data-testid="typewriter-cursor"]'
    );
    expect(entryOneVisible?.textContent).toBe('First.');
    expect(entryOneCursor).toBeNull();

    act(() => {
      root.render(
        <TerminalConsole
          entries={[entryOne, entryTwo]}
          onSubmitCommand={vi.fn()}
        />
      );
    });

    const entryTwoElement = container.querySelector(
      '[data-entry-id="entry-2"]'
    );
    const entryTwoVisible = entryTwoElement?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const entryTwoPending = entryTwoElement?.querySelector(
      '[data-testid="typewriter-pending"]'
    );
    const entryTwoCursor = entryTwoElement?.querySelector(
      '[data-testid="typewriter-cursor"]'
    );

    expect(entryTwoVisible?.textContent).toBe('');
    expect(entryTwoPending?.textContent).toBe('Second.');
    expect(entryTwoCursor).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(entryTwoVisible?.textContent).toBe('S');
    expect(entryTwoPending?.textContent).toBe('econd.');

    act(() => {
      vi.advanceTimersByTime(15 * 6);
    });
    expect(entryTwoVisible?.textContent).toBe('Second.');
    expect(entryTwoPending?.textContent).toBe('');
    expect(
      entryTwoElement?.querySelector('[data-testid="typewriter-cursor"]')
    ).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('types multiple queued entries sequentially', () => {
    vi.useFakeTimers();
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'multi-1',
        output: 'ab',
      },
      {
        id: 'multi-2',
        output: 'xy',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    const entryOne = container.querySelector('[data-entry-id="multi-1"]');
    const entryTwo = container.querySelector('[data-entry-id="multi-2"]');
    const entryOneVisible = entryOne?.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const entryTwoVisible = entryTwo?.querySelector(
      '[data-testid="typewriter-visible"]'
    );

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(entryOneVisible?.textContent).toBe('a');
    expect(entryTwoVisible?.textContent).toBe('');

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(entryOneVisible?.textContent).toBe('ab');
    expect(entryTwoVisible?.textContent).toBe('');

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(entryOneVisible?.textContent).toBe('ab');
    expect(entryTwoVisible?.textContent).toBe('x');

    act(() => {
      vi.advanceTimersByTime(15);
    });
    expect(entryOneVisible?.textContent).toBe('ab');
    expect(entryTwoVisible?.textContent).toBe('xy');

    act(() => {
      root.unmount();
    });
  });

  it('cleans up active interval on unmount while typing is in progress', () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'unmount-entry',
        output: 'Incomplete sequence.',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    act(() => {
      vi.advanceTimersByTime(15);
    });

    act(() => {
      root.unmount();
    });

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('does not schedule interval when entries list is empty', () => {
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    const root = createRoot(container);
    act(() => {
      root.render(<TerminalConsole entries={[]} onSubmitCommand={vi.fn()} />);
    });

    expect(setIntervalSpy).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it('does not schedule interval when entry output is empty string', () => {
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const entries: readonly TTerminalEntry[] = [
      {
        id: 'empty-entry',
        output: '',
      },
    ];

    const root = createRoot(container);
    act(() => {
      root.render(
        <TerminalConsole entries={entries} onSubmitCommand={vi.fn()} />
      );
    });

    expect(setIntervalSpy).not.toHaveBeenCalled();

    const visibleSpan = container.querySelector(
      '[data-testid="typewriter-visible"]'
    );
    const pendingSpan = container.querySelector(
      '[data-testid="typewriter-pending"]'
    );
    const cursor = container.querySelector('[data-testid="typewriter-cursor"]');

    expect(visibleSpan?.textContent).toBe('');
    expect(pendingSpan?.textContent).toBe('');
    expect(cursor).toBeNull();

    act(() => {
      root.unmount();
    });
  });
});
