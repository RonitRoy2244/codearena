import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: {
              primary: 'var(--easy)',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--hard)',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
