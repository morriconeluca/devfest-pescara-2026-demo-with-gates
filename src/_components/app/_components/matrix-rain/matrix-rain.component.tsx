import type { ReactElement } from 'react';

import { useEffect, useState } from 'react';

import type { TMatrixRainProps } from './matrix-rain.type.js';

export const MatrixRain = (props: TMatrixRainProps): null | ReactElement => {
  const [previousIsActive, setPreviousIsActive] = useState(props.isActive);
  const [step, setStep] = useState(0);

  if (props.isActive !== previousIsActive) {
    setPreviousIsActive(props.isActive);
    setStep(0);
  }

  useEffect(() => {
    if (!props.isActive) {
      return () => {};
    }

    const delayMs = Math.max(30, 180 - step * 30);
    const timeoutId = setTimeout(() => {
      setStep((previousStep) => previousStep + 1);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [props.isActive, step]);

  if (!props.isActive) {
    return null;
  }

  const delayMs = Math.max(30, 180 - step * 30);
  const speedLevel = step + 1;
  const coveragePercent = Math.min(100, 20 + step * 20);
  const visibleRows = (coveragePercent / 100) * 20;
  const isFull = coveragePercent === 100;

  const columns = Array.from({ length: 20 }, (_, columnIndex) =>
    Array.from({ length: visibleRows }, (_, rowIndex) => {
      const columnParity = (step + columnIndex) % 2;
      const rowParity = rowIndex % 2;
      const isMatch = columnParity === rowParity;
      return isMatch ? '0' : '1';
    })
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden bg-black font-mono text-green-400"
      data-coverage={String(coveragePercent)}
      data-delay={String(delayMs)}
      data-full-coverage={isFull ? 'true' : 'false'}
      data-speed={String(speedLevel)}
      data-testid="matrix-rain-overlay"
    >
      <div className="pointer-events-none grid flex-1 grid-flow-col auto-cols-fr overflow-hidden p-2 text-center text-xs select-none">
        {columns.map((columnChars, columnIndex) => (
          <div
            className="flex flex-col items-center"
            data-testid="matrix-rain-column"
            key={columnIndex}
          >
            {columnChars.map((digit, rowIndex) => (
              <span key={rowIndex}>{digit}</span>
            ))}
          </div>
        ))}
      </div>
      <button
        className="pointer-events-auto mb-4 self-center rounded border border-green-500 bg-black px-4 py-2 font-mono text-green-400 hover:bg-green-950"
        onClick={props.onClose}
        type="button"
      >
        Esci da Matrix
      </button>
    </div>
  );
};
