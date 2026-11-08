import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MatrixRain } from './matrix-rain.component.js';

describe('MatrixRain', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    container.remove();
  });

  it('renders null and schedules no timers when isActive is false', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={false} onClose={vi.fn()} />);
    });

    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
    expect(container.children).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      root.unmount();
    });
  });

  it('renders overlay with initial step 0 state and binary digits when isActive is true', () => {
    const handleClose = vi.fn();
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={handleClose} />);
    });

    const overlay = container.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay).not.toBeNull();
    expect(overlay?.className).toBe(
      'fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-black font-mono text-green-400'
    );
    expect(overlay?.dataset['coverage']).toBe('20');
    expect(overlay?.dataset['delay']).toBe('180');
    expect(overlay?.dataset['fullCoverage']).toBe('false');
    expect(overlay?.dataset['speed']).toBe('1');
    expect(vi.getTimerCount()).toBe(1);

    const columns = container.querySelectorAll(
      '[data-testid="matrix-rain-column"]'
    );
    expect(columns).toHaveLength(20);

    for (const column of columns) {
      expect(column.children).toHaveLength(4);
      expect(column.textContent).toMatch(/^[01]+$/);
    }

    const [firstColumn, secondColumn] = columns;
    expect(firstColumn?.children[0]?.textContent).toBe('0');
    expect(firstColumn?.children[1]?.textContent).toBe('1');
    expect(secondColumn?.children[0]?.textContent).toBe('1');
    expect(secondColumn?.children[1]?.textContent).toBe('0');

    act(() => {
      root.unmount();
    });
  });

  it('accelerates timer delay and increases speed level step by step', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={vi.fn()} />);
    });

    const overlay = container.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay?.dataset['delay']).toBe('180');
    expect(overlay?.dataset['speed']).toBe('1');

    act(() => {
      vi.advanceTimersByTime(179);
    });
    expect(overlay?.dataset['delay']).toBe('180');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(overlay?.dataset['delay']).toBe('150');
    expect(overlay?.dataset['speed']).toBe('2');

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(overlay?.dataset['delay']).toBe('150');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(overlay?.dataset['delay']).toBe('120');
    expect(overlay?.dataset['speed']).toBe('3');

    act(() => {
      vi.advanceTimersByTime(119);
    });
    expect(overlay?.dataset['delay']).toBe('120');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(overlay?.dataset['delay']).toBe('90');
    expect(overlay?.dataset['speed']).toBe('4');

    act(() => {
      vi.advanceTimersByTime(89);
    });
    expect(overlay?.dataset['delay']).toBe('90');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(overlay?.dataset['delay']).toBe('60');
    expect(overlay?.dataset['speed']).toBe('5');

    act(() => {
      vi.advanceTimersByTime(59);
    });
    expect(overlay?.dataset['delay']).toBe('60');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(overlay?.dataset['delay']).toBe('30');
    expect(overlay?.dataset['speed']).toBe('6');

    act(() => {
      root.unmount();
    });
  });

  it('expands vertical column coverage from 20% to 100% full coverage', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={vi.fn()} />);
    });

    const overlay = container.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );
    const getFirstColumnChildrenLength = (): number => {
      const col = container.querySelector('[data-testid="matrix-rain-column"]');
      return col?.children.length ?? 0;
    };

    expect(overlay?.dataset['coverage']).toBe('20');
    expect(overlay?.dataset['fullCoverage']).toBe('false');
    expect(getFirstColumnChildrenLength()).toBe(4);

    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(overlay?.dataset['coverage']).toBe('40');
    expect(overlay?.dataset['fullCoverage']).toBe('false');
    expect(getFirstColumnChildrenLength()).toBe(8);

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(overlay?.dataset['coverage']).toBe('60');
    expect(overlay?.dataset['fullCoverage']).toBe('false');
    expect(getFirstColumnChildrenLength()).toBe(12);

    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(overlay?.dataset['coverage']).toBe('80');
    expect(overlay?.dataset['fullCoverage']).toBe('false');
    expect(getFirstColumnChildrenLength()).toBe(16);

    act(() => {
      vi.advanceTimersByTime(90);
    });
    expect(overlay?.dataset['coverage']).toBe('100');
    expect(overlay?.dataset['fullCoverage']).toBe('true');
    expect(getFirstColumnChildrenLength()).toBe(20);

    act(() => {
      root.unmount();
    });
  });

  it('clamps delay at 30ms minimum and retains 100% full coverage on subsequent steps', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={vi.fn()} />);
    });

    const overlay = container.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );

    act(() => {
      vi.advanceTimersByTime(180);
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    act(() => {
      vi.advanceTimersByTime(120);
    });
    act(() => {
      vi.advanceTimersByTime(90);
    });
    expect(overlay?.dataset['coverage']).toBe('100');
    expect(overlay?.dataset['fullCoverage']).toBe('true');
    expect(overlay?.dataset['delay']).toBe('60');

    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(overlay?.dataset['delay']).toBe('30');
    expect(overlay?.dataset['speed']).toBe('6');
    expect(overlay?.dataset['fullCoverage']).toBe('true');

    act(() => {
      vi.advanceTimersByTime(29);
    });
    expect(overlay?.dataset['delay']).toBe('30');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(overlay?.dataset['delay']).toBe('30');
    expect(overlay?.dataset['speed']).toBe('7');
    expect(overlay?.dataset['fullCoverage']).toBe('true');

    act(() => {
      root.unmount();
    });
  });

  it('resets step to 0 when toggled from active to inactive and back to active', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={vi.fn()} />);
    });

    act(() => {
      vi.advanceTimersByTime(180);
    });

    const overlay = container.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay?.dataset['speed']).toBe('2');

    act(() => {
      root.render(<MatrixRain isActive={false} onClose={vi.fn()} />);
    });
    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      root.render(<MatrixRain isActive={true} onClose={vi.fn()} />);
    });

    const restoredOverlay = container.querySelector<HTMLElement>(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(restoredOverlay?.dataset['speed']).toBe('1');
    expect(restoredOverlay?.dataset['coverage']).toBe('20');
    expect(restoredOverlay?.dataset['delay']).toBe('180');
    expect(restoredOverlay?.dataset['fullCoverage']).toBe('false');

    act(() => {
      root.unmount();
    });
  });

  it('calls onClose when the exit button is clicked', () => {
    const handleClose = vi.fn();
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={handleClose} />);
    });

    const overlay = container.querySelector(
      '[data-testid="matrix-rain-overlay"]'
    );
    const button = overlay?.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.textContent).toBe('Esci da Matrix');

    act(() => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleClose).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
  });

  it('cancels scheduled timer on unmount', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={vi.fn()} />);
    });

    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      root.unmount();
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});
