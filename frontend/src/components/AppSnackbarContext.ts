import { createContext } from 'react';

type Severity = 'success' | 'error' | 'info' | 'warning';

export interface AppSnackbarContextValue {
  showMessage: (message: string, severity?: Severity) => void;
}

export type AppSnackbarSeverity = Severity;

export const AppSnackbarContext = createContext<AppSnackbarContextValue | undefined>(undefined);
