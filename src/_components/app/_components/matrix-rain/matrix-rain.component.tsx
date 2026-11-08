import type { ReactElement } from 'react';

import type { TMatrixRainProps } from './matrix-rain.type.js';

export const MatrixRain = (props: TMatrixRainProps): null | ReactElement => {
  if (!props.isActive) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
      data-testid="matrix-rain-overlay"
    >
      <button
        className="rounded border border-green-500 bg-black px-4 py-2 font-mono text-green-400 hover:bg-green-950"
        onClick={props.onClose}
        type="button"
      >
        Esci da Matrix
      </button>
    </div>
  );
};
