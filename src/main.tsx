import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './_components/app/index.js';
import './main.css';

const rootElement = document.querySelector('#root');

if (rootElement !== null) {
  createRoot(rootElement).render(
    <StrictMode>
      <App title="Terminale dell'Operatore — Zion" />
    </StrictMode>
  );
}

export { App, type TAppProps } from './_components/app/index.js';
