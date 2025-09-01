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
import { useActionState, useState } from 'react';
import type { ActionState } from '../../interfaces';
import type { UserFormValues, UserUpdateFormValues } from '../../models';
import { createInitialState } from '../../helpers';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export type UserActionState = ActionState<UserFormValues | UserUpdateFormValues>;

interface Props {
  open: boolean;
  user?: UserType | null;
  isCreate: boolean;
  onClose: () => void;
  handleCreate: (
    _: UserActionState | undefined,
    formData: FormData
  ) => Promise<UserActionState | undefined>;
  handleUpdate: (
    _: UserActionState | undefined,
    formData: FormData
  ) => Promise<UserActionState | undefined>;
}

export const UserDialog = ({ 
  onClose, 
  open, 
  user, 
  isCreate, 
  handleCreate, 
  handleUpdate 
}: Props) => {
  const initialState = createInitialState<UserFormValues | UserUpdateFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, submitAction, isPending] = useActionState(
    isCreate ? handleCreate : handleUpdate,
    initialState
  );

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={'sm'} fullWidth>
      <DialogTitle>{user ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <Box key={user?.id ?? 'new'} component={'form'} action={submitAction}>
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
            defaultValue={state?.formData?.username || user?.username || ''}
            error={!!state?.errors?.username}
            helperText={state?.errors?.username}
            sx={{ mb: 2 }}
          />

          {isCreate && (
            <>
              <TextField
                name="password"
                margin="dense"
                label="Contraseña"
                fullWidth
                required
                type={showPassword ? 'text' : 'password'}
                disabled={isPending}
                defaultValue={state?.formData?.password || ''}
                error={!!state?.errors?.password}
                helperText={state?.errors?.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                name="confirmPassword"
                margin="dense"
                label="Confirmar contraseña"
                fullWidth
                required
                type={showConfirmPassword ? 'text' : 'password'}
                disabled={isPending}
                defaultValue={state?.formData?.confirmPassword || ''}
                error={!!state?.errors?.confirmPassword}
                helperText={state?.errors?.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
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