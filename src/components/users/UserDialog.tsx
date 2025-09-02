import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import type { UserType } from './type';
import { useState } from 'react';
import type { UserFormValues } from '../../models';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface Props {
  open: boolean;
  user?: UserType | null;
  isCreate: boolean;
  onClose: () => void;
  handleCreate: (formData: FormData) => Promise<void>;
  handleUpdate: (formData: FormData) => Promise<void>;
}

export const UserDialog = ({
  onClose,
  open,
  user,
  isCreate,
  handleCreate,
  handleUpdate,
}: Props) => {
  const [formData, setFormData] = useState<UserFormValues>({
    username: user?.username || '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<UserFormValues>>({});
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});
    const data = new FormData(e.currentTarget);
    try {
      if (isCreate) await handleCreate(data);
      else await handleUpdate(data);
      setFormData({ username: '', password: '', confirmPassword: '' });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <Box key={user?.id ?? 'new'} component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            name="username"
            autoFocus
            margin="dense"
            label="Nombre de usuario"
            fullWidth
            required
            variant="outlined"
            disabled={isPending}
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            margin="dense"
            label="Contraseña"
            fullWidth
            required={isCreate}
            type={showPassword ? 'text' : 'password'}
            disabled={isPending}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {isCreate && (
            <TextField
              name="confirmPassword"
              margin="dense"
              label="Confirmar contraseña"
              fullWidth
              required
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={isPending}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={20} /> : null}
          >
            {user ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
