import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress errors from external scripts (browser extensions, translation services, etc.)
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  // Filter out errors from external scripts
  const errorMessage = args.join(' ');
  if (
    errorMessage.includes('jquery') ||
    errorMessage.includes('translateContent') ||
    errorMessage.includes('runtime.lastError') ||
    errorMessage.includes('extension port') ||
    errorMessage.includes('back/forward cache') ||
    errorMessage.includes('message channel is closed') ||
    (errorMessage.includes('<path> attribute d') && errorMessage.includes('Expected number'))
  ) {
    // Silently ignore these external script errors
    return;
  }
  // Log all other errors normally
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  // Filter out warnings from external scripts
  const warningMessage = args.join(' ');
  if (
    warningMessage.includes('runtime.lastError') ||
    warningMessage.includes('extension port') ||
    warningMessage.includes('back/forward cache') ||
    warningMessage.includes('message channel is closed')
  ) {
    // Silently ignore these external script warnings
    return;
  }
  // Log all other warnings normally
  originalWarn.apply(console, args);
};

// Also catch unhandled errors from external scripts
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  if (
    errorMessage.includes('jquery') ||
    errorMessage.includes('translateContent') ||
    errorMessage.includes('runtime.lastError') ||
    errorMessage.includes('extension port') ||
    errorMessage.includes('back/forward cache') ||
    errorMessage.includes('message channel is closed') ||
    (errorMessage.includes('<path> attribute d') && errorMessage.includes('Expected number'))
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Suppress unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || String(event.reason) || '';
  if (
    errorMessage.includes('runtime.lastError') ||
    errorMessage.includes('extension port') ||
    errorMessage.includes('back/forward cache') ||
    errorMessage.includes('message channel is closed')
  ) {
    event.preventDefault();
    return false;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
