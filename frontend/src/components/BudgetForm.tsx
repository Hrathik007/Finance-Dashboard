import { zodResolver } from '@hookform/resolvers/zod';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { BudgetRequest } from '../types';

const schema = z.object({
  userId: z.number().int().positive('User ID must be positive'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  period: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof schema>;

interface BudgetFormProps {
  onSubmit: (payload: BudgetRequest) => Promise<void>;
}

const BudgetForm = ({ onSubmit }: BudgetFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: 1,
      category: '',
      amount: 0,
      period: 'MONTHLY',
    },
  });

  const submit = async (values: BudgetFormValues) => {
    await onSubmit(values);
    reset({ ...values, category: '', amount: 0 });
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(submit)}>
      <Controller
        name="userId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="User ID"
            onChange={(event) => field.onChange(Number(event.target.value))}
            error={Boolean(errors.userId)}
            helperText={errors.userId?.message}
          />
        )}
      />
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Category" error={Boolean(errors.category)} helperText={errors.category?.message} />
        )}
      />
      <Controller
        name="amount"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Budget Amount"
            onChange={(event) => field.onChange(Number(event.target.value))}
            error={Boolean(errors.amount)}
            helperText={errors.amount?.message}
          />
        )}
      />
      <Controller
        name="period"
        control={control}
        render={({ field }) => (
          <TextField {...field} select label="Period">
            <MenuItem value="MONTHLY">MONTHLY</MenuItem>
            <MenuItem value="WEEKLY">WEEKLY</MenuItem>
            <MenuItem value="YEARLY">YEARLY</MenuItem>
          </TextField>
        )}
      />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        Create Budget
      </Button>
    </Stack>
  );
};

export default BudgetForm;
