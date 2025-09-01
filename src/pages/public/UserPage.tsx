import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import type { ActionState } from '../../interfaces';
import { schemaUserCreate, type UserFormValues } from '../../models';
import { createInitialState, hanleZodError } from '../../helpers';
import { useAlert, useAxios } from '../../hooks';
import { Link, useNavigate } from 'react-router-dom';
import { useActionState, useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type UserActionState = ActionState<UserFormValues>;
const initialState = createInitialState<UserFormValues>();

export const UserPage = () => {
  const axios = useAxios();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const createUserApi = async (
    _: UserActionState | undefined,
    formData: FormData
  ) => {
    const rawData: UserFormValues = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };
    try {
      schemaUserCreate.parse(rawData);
      await axios.post('/users', {
        username: rawData.username,
        password: rawData.password,
      });
      showAlert('Usuario creado', 'success');
      navigate('/login');
    } catch (error) {
      const err = hanleZodError<UserFormValues>(error, rawData);
      showAlert(err.message, 'error');
      return err;
    }
  };

  const [state, submitAction, isPending] = useActionState(
    createUserApi,
    initialState
  );

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        backgroundColor: '#242424',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: 'sm',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography component={'h1'} variant="h4" gutterBottom>
            Nuevo Usuario
          </Typography>

          <Box action={submitAction} component={'form'} sx={{ width: '100%' }}>
            <TextField
              name="username"
              margin="normal"
              required
              fullWidth
              label="Username"
              autoComplete="username"
              autoFocus
              type="text"
              disabled={isPending}
              defaultValue={state?.formData?.username}
              error={!!state?.errors?.username}
              helperText={state?.errors?.username}
            />
            <TextField
              name="password"
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              disabled={isPending}
              defaultValue={state?.formData?.password}
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
            />
            <TextField
              name="confirmPassword"
              margin="normal"
              required
              fullWidth
              label="Repetir password"
              type={showConfirmPassword ? 'text' : 'password'}
              disabled={isPending}
              defaultValue={state?.formData?.confirmPassword}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isPending ? 'Cargando...' : 'Registrar'}
            </Button>
            <Link to="/login">Ir a login</Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};