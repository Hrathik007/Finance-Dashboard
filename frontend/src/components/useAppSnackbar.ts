import { useContext } from 'react';
import { AppSnackbarContext } from './AppSnackbarContext';

export const useAppSnackbar = () => {
  const context = useContext(AppSnackbarContext);
  if (!context) {
    throw new Error('useAppSnackbar must be used within AppSnackbarProvider');
  }

  return context;
};
