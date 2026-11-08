/**
 * Visual or operational side-effect triggered by executing a terminal command.
 */
export type TCommandEffect = 'matrix' | 'none';

/**
 * Result produced by evaluating a terminal command input string.
 */
export type TCommandExecutionResult = {
  /**
   * Normalized command string that was evaluated.
   */
  readonly command: string;
  /**
   * Side-effect to activate upon command execution.
   */
  readonly effect: TCommandEffect;
  /**
   * Diagnostic or operational output text to render in the console log.
   */
  readonly output: string;
};
