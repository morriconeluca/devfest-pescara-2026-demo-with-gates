/**
 * Properties accepted by the MatrixRain component.
 */
export type TMatrixRainProps = {
  /**
   * Indicates whether the matrix rain visual overlay is actively visible.
   */
  readonly isActive: boolean;
  /**
   * Callback invoked to dismiss or exit the matrix rain effect.
   */
  readonly onClose: () => void;
};
