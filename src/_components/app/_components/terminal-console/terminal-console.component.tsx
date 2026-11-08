import type { ChangeEvent, ReactElement, SyntheticEvent } from 'react';

import { useState } from 'react';

import type { TTerminalConsoleProps } from './terminal-console.type.js';

export const TerminalConsole = (props: TTerminalConsoleProps): ReactElement => {
  const [inputValue, setInputValue] = useState('');

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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        className="flex-1 space-y-2 overflow-y-auto p-4"
        data-testid="terminal-log"
      >
        {props.entries.map((entry) => (
          <div data-entry-id={entry.id} key={entry.id}>
            {entry.command !== undefined && (
              <p className="text-green-300">
                <span className="select-none text-green-600">&gt; </span>
                {entry.command}
              </p>
            )}
            <p className="whitespace-pre-wrap text-green-400">{entry.output}</p>
          </div>
        ))}
      </div>
      <form
        className="flex border-t border-green-800 p-2"
        onSubmit={handleSubmit}
      >
        <span className="mr-2 select-none self-center text-green-500">
          &gt;
        </span>
        <input
          aria-label="Comando terminale"
          className="flex-1 bg-transparent text-green-400 outline-none placeholder:text-green-700"
          onChange={handleChange}
          type="text"
          value={inputValue}
        />
        <button
          className="ml-2 rounded border border-green-700 px-3 py-1 text-green-400 hover:bg-green-950"
          type="submit"
        >
          Invia
        </button>
      </form>
    </div>
  );
};
