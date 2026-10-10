import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the production service worker. Asset precaching is generated at build time
// by vite-plugin-pwa, including JavaScript chunks used by lazy-loaded routes.
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    registerSW({ immediate: true });
  });
}
