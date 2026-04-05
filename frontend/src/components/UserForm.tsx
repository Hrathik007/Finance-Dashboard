import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Role, UserDTO } from '../types';

const roleOptions: Role[] = ['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_VIEWER'];

const schema = z.object({
  username: z.string().min(3, 'Username must have at least 3 characters'),
  password: z.string().min(6, 'Password must have at least 6 characters'),
  email: z.string().email('Enter a valid email'),
  roles: z.array(z.enum(['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_VIEWER'])).min(1, 'Select at least one role'),
  active: z.boolean().optional(),
});

type UserFormValues = z.infer<typeof schema>;

interface UserFormProps {
  onSubmit: (payload: UserDTO) => Promise<void>;
}

const UserForm = ({ onSubmit }: UserFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      roles: ['ROLE_VIEWER'],
      active: true,
    },
  });

  const submit = async (values: UserFormValues) => {
    await onSubmit(values);
    reset({
      username: '',
      password: '',
      email: '',
      roles: ['ROLE_VIEWER'],
      active: true,
    });
  };

  return (
    <Stack spacing={2} component="form" onSubmit={handleSubmit(submit)}>
      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Username" error={Boolean(errors.username)} helperText={errors.username?.message} />
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
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField {...field} label="Email" error={Boolean(errors.email)} helperText={errors.email?.message} />
        )}
      />

      <Controller
        name="roles"
        control={control}
        render={({ field }) => (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Roles
            </Typography>
            <FormGroup row>
              {roleOptions.map((role) => (
                <FormControlLabel
                  key={role}
                  control={
                    <Checkbox
                      checked={field.value.includes(role)}
                      onChange={(event) => {
                        const nextRoles = event.target.checked
                          ? [...field.value, role]
                          : field.value.filter((item) => item !== role);
                        field.onChange(nextRoles);
                      }}
                    />
                  }
                  label={role}
                />
              ))}
            </FormGroup>
            {errors.roles && (
              <Typography variant="caption" color="error">
                {errors.roles.message}
              </Typography>
            )}
          </Box>
        )}
      />

      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox checked={Boolean(field.value)} onChange={(event) => field.onChange(event.target.checked)} />}
            label="Active"
          />
        )}
      />

      <Button variant="contained" type="submit" disabled={isSubmitting}>
        Create User
      </Button>
    </Stack>
  );
};

export default UserForm;
