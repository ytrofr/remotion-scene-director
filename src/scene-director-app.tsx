import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './compositions/SceneDirector/App';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
