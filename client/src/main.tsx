import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress errors from external scripts (browser extensions, translation services, etc.)
const originalError = console.error;
console.error = (...args: any[]) => {
  // Filter out jQuery/SVG errors from external scripts
  const errorMessage = args.join(' ');
  if (
    errorMessage.includes('jquery') ||
    errorMessage.includes('translateContent') ||
    (errorMessage.includes('<path> attribute d') && errorMessage.includes('Expected number'))
  ) {
    // Silently ignore these external script errors
    return;
  }
  // Log all other errors normally
  originalError.apply(console, args);
};

// Also catch unhandled errors from external scripts
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  if (
    errorMessage.includes('jquery') ||
    errorMessage.includes('translateContent') ||
    (errorMessage.includes('<path> attribute d') && errorMessage.includes('Expected number'))
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
