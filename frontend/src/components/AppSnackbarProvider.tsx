import { Alert, Snackbar } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AppSnackbarContext } from './AppSnackbarContext';
import type { AppSnackbarSeverity } from './AppSnackbarContext';

interface AppSnackbarProviderProps {
  children: ReactNode;
}

export const AppSnackbarProvider = ({ children }: AppSnackbarProviderProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AppSnackbarSeverity>('info');

  const showMessage = useCallback((nextMessage: string, nextSeverity: AppSnackbarSeverity = 'info') => {
    setMessage(nextMessage);
    setSeverity(nextSeverity);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ showMessage }), [showMessage]);

  return (
    <AppSnackbarContext.Provider value={value}>
      {children}
      <Snackbar open={open} autoHideDuration={3500} onClose={() => setOpen(false)}>
        <Alert severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
};
