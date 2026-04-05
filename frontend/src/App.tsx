import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuditPage from './pages/AuditPage';
import BudgetPage from './pages/BudgetPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RecordsPage from './pages/RecordsPage';
import UsersPage from './pages/UsersPage';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_VIEWER']}>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route
        path="/records"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ANALYST']}>
            <RecordsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ANALYST']}>
            <BudgetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AuditPage />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
