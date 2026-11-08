import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MatrixRain } from './matrix-rain.component.js';

describe('MatrixRain', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders null when isActive is false', () => {
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={false} onClose={vi.fn()} />);
    });

    expect(
      container.querySelector('[data-testid="matrix-rain-overlay"]')
    ).toBeNull();
    expect(container.children).toHaveLength(0);

    act(() => {
      root.unmount();
    });
  });

  it('renders overlay and close button when isActive is true', () => {
    const handleClose = vi.fn();
    const root = createRoot(container);
    act(() => {
      root.render(<MatrixRain isActive={true} onClose={handleClose} />);
    });

    const overlay = container.querySelector(
      '[data-testid="matrix-rain-overlay"]'
    );
    expect(overlay).not.toBeNull();

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
});
