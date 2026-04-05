import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '../api/auth';
import { useAuth } from '../auth/useAuth';
import { useAppSnackbar } from '../components/useAppSnackbar';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: saveToken } = useAuth();
  const { showMessage } = useAppSnackbar();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin',
      password: 'adminpass',
    },
  });

  const onSubmit = async (payload: LoginFormData) => {
    try {
      const token = await login(payload);
      saveToken(token);
      navigate(from ?? '/dashboard', { replace: true });
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Login failed', 'error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={4} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
          Finance Dashboard
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }} color="text.secondary">
          Sign in to continue.
        </Typography>

        <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Username"
                error={Boolean(errors.username)}
                helperText={errors.username?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                fullWidth
              />
            )}
          />

          <Box>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
              Login
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;
