import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle harmless WebSocket / HMR disconnection warnings in sandboxed preview
if (typeof window !== 'undefined') {
  // Purge and unregister any legacy PWA service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message?.includes('WebSocket') ||
        event.reason.toString().includes('WebSocket') ||
        event.reason.message?.includes('closed without opened'))
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('WebSocket') ||
      event.message?.includes('closed without opened')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
