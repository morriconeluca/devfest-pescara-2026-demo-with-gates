import { describe, expect, it } from 'vitest';

import { executeCommand } from './execute-command.util.js';

describe('executeCommand', () => {
  it('returns matrix effect and sequence output when command is "matrix"', () => {
    const result = executeCommand('matrix');

    expect(result).toStrictEqual({
      command: 'matrix',
      effect: 'matrix',
      output: 'Avvio sequenza Matrix: pioggia di codice binario in corso...',
    });
  });

  it('matches "matrix" command case-insensitively and trims surrounding whitespace', () => {
    const result = executeCommand('   MATRIX   ');

    expect(result).toStrictEqual({
      command: 'MATRIX',
      effect: 'matrix',
      output: 'Avvio sequenza Matrix: pioggia di codice binario in corso...',
    });
  });

  it('matches mixed-case "Matrix" with surrounding whitespace', () => {
    const result = executeCommand('  Matrix  ');

    expect(result).toStrictEqual({
      command: 'Matrix',
      effect: 'matrix',
      output: 'Avvio sequenza Matrix: pioggia di codice binario in corso...',
    });
  });

  it('matches mixed-case "mAtRiX" with no whitespace', () => {
    const result = executeCommand('mAtRiX');

    expect(result).toStrictEqual({
      command: 'mAtRiX',
      effect: 'matrix',
      output: 'Avvio sequenza Matrix: pioggia di codice binario in corso...',
    });
  });

  it('returns none effect and exact knock text when command is "knock"', () => {
    const result = executeCommand('knock');

    expect(result).toStrictEqual({
      command: 'knock',
      effect: 'none',
      output: 'Knock, knock, Neo...',
    });
  });

  it('matches uppercase "KNOCK" with whitespace', () => {
    const result = executeCommand('   KNOCK   ');

    expect(result).toStrictEqual({
      command: 'KNOCK',
      effect: 'none',
      output: 'Knock, knock, Neo...',
    });
  });

  it('matches mixed-case "Knock" with whitespace', () => {
    const result = executeCommand('  Knock  ');

    expect(result).toStrictEqual({
      command: 'Knock',
      effect: 'none',
      output: 'Knock, knock, Neo...',
    });
  });

  it('matches mixed-case "kNoCk" with no whitespace', () => {
    const result = executeCommand('kNoCk');

    expect(result).toStrictEqual({
      command: 'kNoCk',
      effect: 'none',
      output: 'Knock, knock, Neo...',
    });
  });

  it('returns none effect and exact whoami text when command is "whoami"', () => {
    const result = executeCommand('whoami');

    expect(result).toStrictEqual({
      command: 'whoami',
      effect: 'none',
      output: "Tu sei l'Eletto",
    });
  });

  it('matches uppercase "WHOAMI" with whitespace', () => {
    const result = executeCommand('   WHOAMI   ');

    expect(result).toStrictEqual({
      command: 'WHOAMI',
      effect: 'none',
      output: "Tu sei l'Eletto",
    });
  });

  it('matches mixed-case "WhoAmI" with whitespace', () => {
    const result = executeCommand('  WhoAmI  ');

    expect(result).toStrictEqual({
      command: 'WhoAmI',
      effect: 'none',
      output: "Tu sei l'Eletto",
    });
  });

  it('matches mixed-case "wHoAmI" with no whitespace', () => {
    const result = executeCommand('wHoAmI');

    expect(result).toStrictEqual({
      command: 'wHoAmI',
      effect: 'none',
      output: "Tu sei l'Eletto",
    });
  });

  it('returns none effect and full command list for "help"', () => {
    const expectedOutput = `Comandi disponibili:
- help: Mostra la lista dei comandi disponibili
- knock: Mostra sul display il testo "Knock, knock, Neo..."
- matrix: Avvia la sequenza Matrix con pioggia di codice binario
- whoami: Risponde "Tu sei l'Eletto"`;

    const result = executeCommand('help');

    expect(result).toStrictEqual({
      command: 'help',
      effect: 'none',
      output: expectedOutput,
    });
    expect(result.output).toContain('help');
    expect(result.output).toContain('matrix');
    expect(result.output).toContain('knock');
    expect(result.output).toContain('whoami');
    expect(result.output).toContain('Mostra la lista dei comandi disponibili');
    expect(result.output).toContain(
      'Mostra sul display il testo "Knock, knock, Neo..."'
    );
    expect(result.output).toContain(
      'Avvia la sequenza Matrix con pioggia di codice binario'
    );
    expect(result.output).toContain('Risponde "Tu sei l\'Eletto"');
  });

  it('matches uppercase "HELP" with whitespace', () => {
    const result = executeCommand('   HELP   ');

    expect(result.command).toBe('HELP');
    expect(result.effect).toBe('none');
    expect(result.output).toContain('help');
    expect(result.output).toContain('matrix');
    expect(result.output).toContain('knock');
    expect(result.output).toContain('whoami');
  });

  it('matches mixed-case "HeLp" with whitespace', () => {
    const result = executeCommand('  HeLp  ');

    expect(result.command).toBe('HeLp');
    expect(result.effect).toBe('none');
    expect(result.output).toContain('help');
    expect(result.output).toContain('matrix');
    expect(result.output).toContain('knock');
    expect(result.output).toContain('whoami');
  });

  it('returns diagnostic message for unrecognized command "status"', () => {
    const result = executeCommand('  status  ');

    expect(result).toStrictEqual({
      command: 'status',
      effect: 'none',
      output:
        'Comando non riconosciuto: "status". Digita "help" per la lista dei comandi disponibili.',
    });
  });

  it('returns diagnostic message for unrecognized command with mixed case', () => {
    const result = executeCommand('  CustomCmd  ');

    expect(result).toStrictEqual({
      command: 'CustomCmd',
      effect: 'none',
      output:
        'Comando non riconosciuto: "CustomCmd". Digita "help" per la lista dei comandi disponibili.',
    });
  });

  it('returns diagnostic message for empty input', () => {
    const result = executeCommand('');

    expect(result).toStrictEqual({
      command: '',
      effect: 'none',
      output:
        'Comando non riconosciuto: "". Digita "help" per la lista dei comandi disponibili.',
    });
  });

  it('returns diagnostic message for whitespace-only input', () => {
    const result = executeCommand(' '.repeat(4));

    expect(result).toStrictEqual({
      command: '',
      effect: 'none',
      output:
        'Comando non riconosciuto: "". Digita "help" per la lista dei comandi disponibili.',
    });
  });

  it('returns diagnostic message for prefix or similar unknown commands', () => {
    const result = executeCommand('matrix-rain');

    expect(result).toStrictEqual({
      command: 'matrix-rain',
      effect: 'none',
      output:
        'Comando non riconosciuto: "matrix-rain". Digita "help" per la lista dei comandi disponibili.',
    });
  });
});
