const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('message channel closed')
  ) {
    return;
  }
  originalError(...args);
};

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
