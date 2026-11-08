import type { TCommandExecutionResult } from './execute-command.type.js';

export const executeCommand = (rawInput: string): TCommandExecutionResult => {
  const trimmed = rawInput.trim();
  const normalized = trimmed.toLowerCase();

  switch (normalized) {
    case 'help': {
      return {
        command: trimmed,
        effect: 'none',
        output:
          'Comandi disponibili:\n- help: Mostra la lista dei comandi disponibili\n- knock: Mostra sul display il testo "Knock, knock, Neo..."\n- matrix: Avvia la sequenza Matrix con pioggia di codice binario\n- whoami: Risponde "Tu sei l\'Eletto"',
      };
    }
    case 'knock': {
      return {
        command: trimmed,
        effect: 'none',
        output: 'Knock, knock, Neo...',
      };
    }
    case 'matrix': {
      return {
        command: trimmed,
        effect: 'matrix',
        output: 'Avvio sequenza Matrix: pioggia di codice binario in corso...',
      };
    }
    case 'whoami': {
      return {
        command: trimmed,
        effect: 'none',
        output: "Tu sei l'Eletto",
      };
    }
    default: {
      return {
        command: trimmed,
        effect: 'none',
        output: `Comando non riconosciuto: "${trimmed}". Digita "help" per la lista dei comandi disponibili.`,
      };
    }
  }
};
