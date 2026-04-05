import { useState } from 'react';
import type { ReactNode } from 'react';
import { clearToken, getCurrentUser, setToken } from './token';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  const login = (token: string) => {
    setToken(token);
    setCurrentUser(getCurrentUser());
  };

  const logout = () => {
    clearToken();
    setCurrentUser(getCurrentUser());
  };

  const value = {
    token: currentUser.token,
    username: currentUser.username,
    roles: currentUser.roles,
    isAuthenticated: Boolean(currentUser.token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
