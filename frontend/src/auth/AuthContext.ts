import { createContext } from 'react';
import type { Role } from '../types';

export interface AuthContextValue {
  token: string | null;
  username: string | null;
  roles: Role[];
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
