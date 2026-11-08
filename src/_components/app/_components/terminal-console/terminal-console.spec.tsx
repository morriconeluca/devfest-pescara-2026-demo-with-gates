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
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
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
    expect(commandEntry?.textContent).toContain('status');
    expect(commandEntry?.textContent).toContain('All systems operational.');

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
});
