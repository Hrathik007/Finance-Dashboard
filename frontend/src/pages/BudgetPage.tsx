import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { createBudget, getBudgetStatus } from '../api/budget';
import BudgetForm from '../components/BudgetForm';
import { useAppSnackbar } from '../components/useAppSnackbar';
import type { BudgetStatus } from '../types';

const BudgetPage = () => {
  const { showMessage } = useAppSnackbar();
  const [statusUserId, setStatusUserId] = useState(1);
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);

  const handleCreateBudget = async (payload: { userId: number; category: string; amount: number; period?: string }) => {
    try {
      await createBudget(payload);
      showMessage('Budget created successfully', 'success');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create budget', 'error');
      throw error;
    }
  };

  const loadStatus = async () => {
    try {
      const response = await getBudgetStatus(statusUserId);
      setStatuses(Array.isArray(response) ? response : [response]);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to load budget status', 'error');
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Budget Management
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 700 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Create Budget
        </Typography>
        <BudgetForm onSubmit={handleCreateBudget} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Budget Status
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="User ID"
            type="number"
            value={statusUserId}
            onChange={(event) => setStatusUserId(Number(event.target.value))}
          />
          <Button variant="outlined" onClick={() => void loadStatus()}>
            Load Status
          </Button>
        </Stack>

        <Stack spacing={1.5}>
          {statuses.map((status, index) => (
            <Paper key={`${status.category ?? 'unknown'}-${index}`} variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2">Category: {status.category ?? 'N/A'}</Typography>
              <Typography variant="body2">Used: {status.used ?? 0}</Typography>
              <Typography variant="body2">Remaining: {status.remaining ?? 0}</Typography>
              <Typography variant="body2">Status: {status.status ?? 'N/A'}</Typography>
            </Paper>
          ))}

          {statuses.length === 0 && (
            <Typography color="text.secondary">No budget status loaded. Enter a user ID and click Load Status.</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default BudgetPage;
