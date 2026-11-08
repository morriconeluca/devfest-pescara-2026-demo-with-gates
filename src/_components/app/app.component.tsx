import type { ReactElement } from 'react';

import type { TAppProps } from './app.type.js';

export const App = (props: TAppProps): ReactElement => {
  const trimmedTitle = props.title.trim();
  const heading = trimmedTitle.length > 0 ? trimmedTitle : 'default';
  return (
    <main>
      <h1>{heading}</h1>
    </main>
  );
};
