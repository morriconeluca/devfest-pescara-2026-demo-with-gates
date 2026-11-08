import { describe, expect, it } from 'vitest';

import { executeCommand } from './execute-command.util.js';

describe('executeCommand', () => {
  it('returns matrix effect and sequence output when command is "matrix"', () => {
    const result = executeCommand('matrix');

    expect(result).toEqual({
      command: 'matrix',
      effect: 'matrix',
      output: 'Avvio sequenza Matrix...',
    });
  });

  it('matches "matrix" command case-insensitively and trims surrounding whitespace', () => {
    const result = executeCommand('   MATRIX   ');

    expect(result).toEqual({
      command: 'MATRIX',
      effect: 'matrix',
      output: 'Avvio sequenza Matrix...',
    });
  });

  it('matches mixed-case "Matrix" with surrounding whitespace', () => {
    const result = executeCommand('  Matrix  ');

    expect(result).toEqual({
      command: 'Matrix',
      effect: 'matrix',
      output: 'Avvio sequenza Matrix...',
    });
  });

  it('returns none effect and trimmed output for arbitrary command', () => {
    const result = executeCommand('  status  ');

    expect(result).toEqual({
      command: 'status',
      effect: 'none',
      output: 'status',
    });
  });

  it('handles empty input after trimming', () => {
    const result = executeCommand(' '.repeat(3));

    expect(result).toEqual({
      command: '',
      effect: 'none',
      output: '',
    });
  });
});
