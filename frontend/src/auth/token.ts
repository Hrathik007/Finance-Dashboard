import type { JwtPayload, Role } from '../types';

const TOKEN_KEY = 'token';

const decodeBase64Url = (segment: string): string => {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const decodeToken = (token: string | null): JwtPayload | null => {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  const payload = decodeToken(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
};

export const getCurrentUser = () => {
  const token = getToken();
  const payload = decodeToken(token);

  return {
    username: payload?.sub ?? null,
    roles: Array.isArray(payload?.roles) ? (payload.roles as Role[]) : [],
    exp: payload?.exp ?? null,
    token,
  };
};

export const hasRole = (role: Role): boolean => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return false;
  }

  const payload = decodeToken(token);
  return Array.isArray(payload?.roles) ? payload.roles.includes(role) : false;
};

export const hasAnyRole = (roles: Role[]): boolean => {
  if (roles.length === 0) {
    return true;
  }

  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return false;
  }

  const payload = decodeToken(token);
  const userRoles = Array.isArray(payload?.roles) ? payload.roles : [];
  return roles.some((role) => userRoles.includes(role));
};
