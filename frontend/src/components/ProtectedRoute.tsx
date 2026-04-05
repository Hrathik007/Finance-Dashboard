import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import type { Role } from '../types';
import { getToken, hasAnyRole, isTokenExpired } from '../auth/token';

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
