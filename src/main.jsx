import React from 'react';
import ReactDOM from 'react-dom/client';
import LayerUp from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LayerUp />
  </React.StrictMode>
);

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.log('Service Worker registration failed:', err);
  });
}
