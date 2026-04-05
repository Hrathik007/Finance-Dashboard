import {
  Button,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { createUser, listUsers, updateUserStatus } from '../api/users';
import UserForm from '../components/UserForm';
import { useAppSnackbar } from '../components/useAppSnackbar';
import type { UserDTO, UserResponse } from '../types';

const UsersPage = () => {
  const { showMessage } = useAppSnackbar();
  const [users, setUsers] = useState<UserResponse[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await listUsers();
      setUsers(response);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to load users', 'error');
    }
  }, [showMessage]);

  useEffect(() => {
    Promise.resolve().then(() => loadUsers());
  }, [loadUsers]);

  const handleCreateUser = async (payload: UserDTO) => {
    try {
      await createUser(payload);
      showMessage('User created successfully', 'success');
      await loadUsers();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create user', 'error');
      throw error;
    }
  };

  const handleStatusChange = async (user: UserResponse) => {
    try {
      await updateUserStatus(user.id, !user.active);
      showMessage(`User ${user.username} status updated`, 'success');
      await loadUsers();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to update status', 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, maxWidth: 700 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Create User
        </Typography>
        <UserForm onSubmit={handleCreateUser} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Users</Typography>
          <Button variant="outlined" onClick={() => void loadUsers()}>
            Refresh
          </Button>
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email ?? '-'}</TableCell>
                <TableCell>{user.roles.join(', ')}</TableCell>
                <TableCell>{user.active ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Switch checked={user.active} onChange={() => void handleStatusChange(user)} />
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>No users found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default UsersPage;
