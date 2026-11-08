import type { ReactElement } from 'react';

import { useState } from 'react';

import type { TAppProps } from './app.type.js';

import { MatrixRain } from './_components/matrix-rain/index.js';
import {
  TerminalConsole,
  type TTerminalEntry,
} from './_components/terminal-console/index.js';
import { executeCommand } from './_utils/execute-command/index.js';

export const App = (props: TAppProps): ReactElement => {
  const [entries, setEntries] = useState<readonly TTerminalEntry[]>([
    {
      id: 'boot',
      output:
        'Connessione al mainframe di Zion stabilita. Digita "help" per la lista dei comandi.',
    },
  ]);
  const [isMatrixActive, setIsMatrixActive] = useState(false);

  const trimmedTitle = props.title?.trim();
  const heading =
    trimmedTitle !== undefined && trimmedTitle.length > 0
      ? trimmedTitle
      : "Terminale dell'Operatore \u{2014} Zion";

  const handleCommandSubmit = (rawCommand: string): void => {
    const trimmedCommand = rawCommand.trim();
    if (trimmedCommand.length === 0) {
      return;
    }

    const result = executeCommand(rawCommand);
    const newEntry: TTerminalEntry = {
      command: trimmedCommand,
      id: String(entries.length + 1),
      output: result.output,
    };

    setEntries((previousEntries) => [...previousEntries, newEntry]);

    if (result.effect === 'matrix') {
      setIsMatrixActive(true);
    }
  };

  const handleCloseMatrix = (): void => {
    setIsMatrixActive(false);
  };

  return (
    <main className="flex min-h-screen flex-col bg-black font-mono text-green-400">
      <h1 className="border-b border-green-800 p-4 text-xl font-bold tracking-wider">
        {heading}
      </h1>
      <TerminalConsole
        entries={entries}
        onSubmitCommand={handleCommandSubmit}
      />
      <MatrixRain isActive={isMatrixActive} onClose={handleCloseMatrix} />
    </main>
  );
};
