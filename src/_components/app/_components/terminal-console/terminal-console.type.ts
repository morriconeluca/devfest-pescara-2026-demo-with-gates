/**
 * Properties accepted by the TerminalConsole component.
 */
export type TTerminalConsoleProps = {
  /**
   * List of historical log entries to display in the terminal.
   */
  readonly entries: readonly TTerminalEntry[];
  /**
   * Callback invoked when a non-empty command is submitted.
   */
  readonly onSubmitCommand: (rawCommand: string) => void;
};

/**
 * Historical record displayed in the operator terminal output log.
 */
export type TTerminalEntry = {
  /**
   * Optional command issued by the operator.
   */
  readonly command?: string;
  /**
   * Unique identifier of the terminal entry.
   */
  readonly id: string;
  /**
   * Output message or diagnostic text rendered for the entry.
   */
  readonly output: string;
};
