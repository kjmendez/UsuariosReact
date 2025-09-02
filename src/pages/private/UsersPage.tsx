import { Box } from '@mui/material';
import { UserDialog, UserFilter, UserHeader, UserTabla } from '../../components';
import type { UserType, UserFilterStatusType } from '../../components/users/type';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { useAlert, useAxios, useAuth } from '../../hooks';
import { schemaUserCreate, schemaUserUpdate, type UserFormValues } from '../../models';
import { hanleZodError } from '../../helpers';

export const UsersPage = () => {
  const { showAlert } = useAlert();
  const axios = useAxios();
  const { token, logout } = useAuth();

  const [filterStatus, setFilterStatus] = useState<UserFilterStatusType>('all');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isCreate, setIsCreate] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listUsersApi();
  }, [search, filterStatus, paginationModel, sortModel]);

  const listUsersApi = async () => {
    setLoading(true);
    try {
      const orderBy = sortModel[0]?.field;
      const orderDir = sortModel[0]?.sort;
      const response = await axios.get('/users', {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy,
          orderDir,
          search,
          status:
            filterStatus === 'all'
              ? undefined
              : filterStatus === 'active'
              ? 'active'
              : 'inactive',
        },
      });

      const dataArray = Array.isArray(response.data.data) ? response.data.data : response.data.users || response.data.items || [];
      const mappedUsers = dataArray.map((u: any) => ({ ...u, status: u.status.toUpperCase() }));
      setUsers(mappedUsers);
      setTotal(response.data.total || response.data.count || mappedUsers.length);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) logout();
      showAlert(error instanceof Error ? error.message : 'Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenDialog(true);
    setUser(null);
    setIsCreate(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setUser(null);
  };

  const handleOpenEditDialog = (user: UserType) => {
    setOpenDialog(true);
    setUser(user);
    setIsCreate(false);
  };

  const handleCreate = async (formdata: FormData) => {
    const rawData = {
      username: formdata.get('username') as string,
      password: formdata.get('password') as string,
      confirmPassword: formdata.get('confirmPassword') as string,
    };
    try {
      schemaUserCreate.parse(rawData);
      await axios.post('/users', { username: rawData.username, password: rawData.password });
      showAlert('Usuario creado exitosamente', 'success');
      listUsersApi();
      handleCloseDialog();
    } catch (error: any) {
      const err = hanleZodError<UserFormValues>(error, rawData);
      showAlert(err.message, 'error');
    }
  };

  const handleUpdate = async (formdata: FormData) => {
    const username = formdata.get('username') as string;
    const password = formdata.get('password') as string;
    const rawData: any = { username };
    if (password) rawData.password = password;
    try {
      schemaUserUpdate.parse(rawData);
      await axios.put(`/users/${user!.id}`, rawData);
      showAlert('Usuario actualizado exitosamente', 'success');
      listUsersApi();
      handleCloseDialog();
    } catch (error: any) {
      let errorMessage = 'Error al actualizar usuario';
      if (error.response?.data) errorMessage = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
      showAlert(errorMessage, 'error');
    }
  };

  const handleToggleStatus = async (user: UserType) => {
    try {
      const newStatus = user.status.toLowerCase() === 'active' ? 'inactive' : 'active';
      await axios.patch(`/users/${user.id}`, { status: newStatus });
      showAlert(`Usuario ${newStatus === 'active' ? 'activado' : 'inactivado'} correctamente`, 'success');
      listUsersApi();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) logout();
      showAlert(error.response?.data?.message || 'Error al cambiar estado del usuario', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return showAlert('No autorizado. Debes iniciar sesión', 'error');
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await axios.delete(`/users/${id}`);
      showAlert('Usuario eliminado exitosamente', 'success');
      listUsersApi();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) logout();
      showAlert(error.response?.data?.message || 'Error al eliminar usuario', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <UserHeader handleOpenCreateDialog={handleOpenCreateDialog} />
      <UserFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} setSearch={setSearch} />
      <UserTabla
        users={users}
        rowCount={total}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        handleDelete={handleDelete}
        handleToggleStatus={handleToggleStatus}
        handleOpenEditDialog={handleOpenEditDialog}
        loading={loading}
      />
      <UserDialog
        open={openDialog}
        user={user}
        isCreate={isCreate}
        onClose={handleCloseDialog}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
      />
    </Box>
  );
};
