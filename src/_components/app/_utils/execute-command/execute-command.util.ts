import type { TCommandExecutionResult } from './execute-command.type.js';

export const executeCommand = (rawInput: string): TCommandExecutionResult => {
  const normalized = rawInput.trim();

  if (normalized.toLowerCase() === 'matrix') {
    return {
      command: normalized,
      effect: 'matrix',
      output: 'Avvio sequenza Matrix...',
    };
  }

  return {
    command: normalized,
    effect: 'none',
    output: normalized,
  };
};
