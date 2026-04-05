import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearToken, getCurrentUser } from '../auth/token';

interface NavbarProps {
  title: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography sx={{ mr: 2 }} variant="body2">
          {user.username ?? 'User'}
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
