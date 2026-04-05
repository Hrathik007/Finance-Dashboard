import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { FinancialRecordDTO } from '../types';

const schema = z.object({
  id: z.number().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type RecordFormValues = z.infer<typeof schema>;

interface RecordFormProps {
  open: boolean;
  initialValue?: FinancialRecordDTO | null;
  onClose: () => void;
  onSubmit: (payload: FinancialRecordDTO) => Promise<void>;
}

const defaults: RecordFormValues = {
  amount: 0,
  type: 'EXPENSE',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
};

const RecordForm = ({ open, initialValue, onClose, onSubmit }: RecordFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(
      initialValue
        ? { ...initialValue, notes: initialValue.notes ?? '' }
        : defaults,
    );
  }, [initialValue, open, reset]);

  const submit = async (values: RecordFormValues) => {
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue?.id ? 'Edit Record' : 'Add Record'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Amount"
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(errors.amount)}
                helperText={errors.amount?.message}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Type" error={Boolean(errors.type)} helperText={errors.type?.message}>
                <MenuItem value="INCOME">INCOME</MenuItem>
                <MenuItem value="EXPENSE">EXPENSE</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Category"
                error={Boolean(errors.category)}
                helperText={errors.category?.message}
              />
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.date)}
                helperText={errors.date?.message}
              />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => <TextField {...field} multiline minRows={3} label="Notes" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(submit)} disabled={isSubmitting}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecordForm;
