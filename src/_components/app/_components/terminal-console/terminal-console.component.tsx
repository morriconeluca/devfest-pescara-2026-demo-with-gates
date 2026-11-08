import type { ChangeEvent, ReactElement, SyntheticEvent } from 'react';

import { useEffect, useState } from 'react';

import type { TTerminalConsoleProps } from './terminal-console.type.js';

export const TerminalConsole = (props: TTerminalConsoleProps): ReactElement => {
  const [inputValue, setInputValue] = useState('');
  const [visibleLengths, setVisibleLengths] = useState<
    Readonly<Record<string, number>>
  >({});

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (inputValue.trim().length === 0) {
      return;
    }

    props.onSubmitCommand(inputValue);
    setInputValue('');
  };

  useEffect(() => {
    const hasAnyOutput = props.entries.some((entry) => entry.output.length > 0);
    if (!hasAnyOutput) {
      return () => {};
    }

    const intervalId = setInterval(() => {
      setVisibleLengths((previous) => {
        const incompleteEntry = props.entries.find((entry) => {
          const currentLength = previous[entry.id] ?? 0;
          return currentLength < entry.output.length;
        });

        if (incompleteEntry === undefined) {
          clearInterval(intervalId);
          return previous;
        }

        const currentLength = previous[incompleteEntry.id] ?? 0;
        return {
          ...previous,
          [incompleteEntry.id]: currentLength + 1,
        };
      });
    }, 15);

    return () => {
      clearInterval(intervalId);
    };
  }, [props.entries]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-black font-mono text-green-400">
      <div
        className="flex-1 space-y-2 overflow-y-auto p-4"
        data-testid="terminal-log"
      >
        {props.entries.map((entry) => {
          const visibleLength = visibleLengths[entry.id] ?? 0;
          return (
            <div data-entry-id={entry.id} key={entry.id}>
              {entry.command !== undefined && (
                <p className="text-green-300">
                  <span className="select-none text-green-600">
                    zion@operator:~$
                  </span>{' '}
                  {entry.command}
                </p>
              )}
              <p className="whitespace-pre-wrap text-green-400">
                <span data-testid="typewriter-visible">
                  {entry.output.slice(0, visibleLength)}
                </span>
                {visibleLength < entry.output.length && (
                  <span
                    aria-hidden="true"
                    className="animate-pulse after:content-['█']"
                    data-testid="typewriter-cursor"
                  />
                )}
                <span className="sr-only" data-testid="typewriter-pending">
                  {entry.output.slice(visibleLength)}
                </span>
              </p>
            </div>
          );
        })}
      </div>
      <form
        className="flex border-t border-green-800 bg-black/90 p-2 shadow-[0_-2px_10px_rgba(34,197,94,0.15)]"
        onSubmit={handleSubmit}
      >
        <span className="mr-2 select-none self-center font-bold text-green-500">
          zion@operator:~$
        </span>
        <input
          aria-label="Comando terminale"
          className="flex-1 bg-transparent text-green-400 outline-none placeholder:text-green-700"
          onChange={handleChange}
          type="text"
          value={inputValue}
        />
        <button
          className="ml-2 rounded border border-green-700 px-3 py-1 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.2)] hover:bg-green-950 hover:shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          type="submit"
        >
          Invia
        </button>
      </form>
    </div>
  );
};
