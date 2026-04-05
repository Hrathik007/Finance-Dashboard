import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { hasRole } from '../auth/token';

const drawerWidth = 240;

const navItems: Array<{
  label: string;
  path: string;
  adminOnly?: boolean;
  analystOnly?: boolean;
  hideForViewer?: boolean;
}> = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Records', path: '/records', hideForViewer: true },
  { label: 'Budget', path: '/budget', hideForViewer: true },
  { label: 'Users', path: '/users', adminOnly: true },
  { label: 'Audit', path: '/audit', adminOnly: true },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <CssBaseline />
      <Navbar title="Finance Dashboard" />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {navItems
            .filter((item) => {
              if (item.adminOnly && !hasRole('ROLE_ADMIN')) {
                return false;
              }

              if (item.analystOnly && !hasRole('ROLE_ANALYST')) {
                return false;
              }

              if (item.hideForViewer && hasRole('ROLE_VIEWER')) {
                return false;
              }

              return true;
            })
            .map((item) => (
              <ListItemButton
                key={item.path}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
