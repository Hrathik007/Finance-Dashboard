import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './auth/AuthProvider';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { AppSnackbarProvider } from './components/AppSnackbarProvider';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0f4c5c',
    },
    secondary: {
      main: '#ff7d00',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppErrorBoundary>
        <AuthProvider>
          <AppSnackbarProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppSnackbarProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
);
