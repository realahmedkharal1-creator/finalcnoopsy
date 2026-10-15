import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// If a video has no HD thumbnail, fall back to the standard one
document.addEventListener(
  'error',
  (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.src.includes('/maxresdefault.jpg')) {
      img.src = img.src.replace('/maxresdefault.jpg', '/hqdefault.jpg');
    }
  },
  true
);
