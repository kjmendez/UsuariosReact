import { Box } from '@mui/material';
import {
  UserDialog,
  UserFilter,
  UserHeader,
  UserTabla,
  type UserActionState,
} from '../../components';
import { useEffect, useState } from 'react';
import type { UserFilterStatusType, UserType } from '../../components/users/type';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useAlert, useAxios } from '../../hooks';
import { hanleZodError } from '../../helpers';
import { schemaUserCreate, schemaUserUpdate, type UserFormValues, type UserUpdateFormValues } from '../../models';

export const UsersPage = () => {
  const { showAlert } = useAlert();
  const axios = useAxios();

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
          active: filterStatus === 'all' ? undefined : filterStatus === 'active',
        },
      });
      
      console.log('Respuesta de GET /users:', response.data); 
      
      if (response.data && response.data.data !== undefined) {
        setUsers(response.data.data);
        setTotal(response.data.total);
      } 
      else if (Array.isArray(response.data)) {
        setUsers(response.data);
        setTotal(response.data.length); 
      }
      else {
        setUsers(response.data.users || response.data.items || []);
        setTotal(response.data.total || response.data.count || 0);
      }
    } catch (error) {
      console.error('Error en listUsersApi:', error); 
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

  const handleCreate = async (
    _: UserActionState | undefined,
    formdata: FormData
  ) => {
    const rawData = {
      username: formdata.get('username') as string,
      password: formdata.get('password') as string,
      confirmPassword: formdata.get('confirmPassword') as string,
    };

    try {
      schemaUserCreate.parse(rawData);
      
      const response = await axios.post('/users', {
        username: rawData.username,
        password: rawData.password,
      });
      
      console.log('Respuesta de POST /users:', response.data); 
      
      showAlert('Usuario creado exitosamente', 'success');
      listUsersApi();
      handleCloseDialog();
      return;
    } catch (error: any) {
      console.error('Error en handleCreate:', error.response?.data || error.message); 
      const err = hanleZodError<UserFormValues>(error, rawData);
      showAlert(err.message, 'error');
      return err;
    }
  };

  const handleUpdate = async (
    _: UserActionState | undefined,
    formdata: FormData
  ) => {
    const rawData = {
      username: formdata.get('username') as string,
    };

    try {
      schemaUserUpdate.parse(rawData);
      
      console.log('Actualizando usuario ID:', user!.id); 
      console.log('Datos a enviar:', rawData); 
      
      // Payload simple
      const response = await axios.put(`/users/${user!.id}`, rawData);
      
      // Si el backend espera estructura diferente
      // const response = await axios.put(`/users/${user!.id}`, {
      //   user: rawData
      // });
      
      // Con headers específicos
      // const response = await axios.put(`/users/${user!.id}`, rawData, {
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      console.log('Respuesta de PUT /users:', response.data); 
      
      showAlert('Usuario actualizado exitosamente', 'success');
      listUsersApi();
      handleCloseDialog();
      return;
    } catch (error: any) {
      console.error('Error completo en handleUpdate:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      
      let errorMessage = 'Error al actualizar usuario';
      
      if (error.response?.data) {
        errorMessage = error.response.data.message 
          || error.response.data.error
          || JSON.stringify(error.response.data);
      }
      
      const err = hanleZodError<UserUpdateFormValues>(error, rawData);
      showAlert(errorMessage, 'error');
      return err;
    }
  };

  const handleToggleStatus = async (id: number, active: boolean) => {
    try {
      const confirmed = window.confirm(
        `¿Estás seguro de que quieres ${active ? 'inactivar' : 'activar'} este usuario?`
      );
      if (!confirmed) return;

      const response = await axios.patch(`/users/${id}`, {
        active: !active,
      });
      
      console.log('Respuesta de PATCH /users:', response.data); 
      
      showAlert(`Usuario ${active ? 'inactivado' : 'activado'} exitosamente`, 'success');
      listUsersApi();
    } catch (error: any) {
      console.error('Error en handleToggleStatus:', error.response?.data || error.message); 
      showAlert(error instanceof Error ? error.message : 'Error al cambiar estado', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmed = window.confirm('¿Estás seguro de eliminar este usuario?');
      if (!confirmed) return;

      const response = await axios.delete(`/users/${id}`);
      
      console.log('Respuesta de DELETE /users:', response.data); 
      
      showAlert('Usuario eliminado exitosamente', 'success');
      listUsersApi();
    } catch (error: any) {
      console.error('Error en handleDelete:', error.response?.data || error.message); 
      showAlert(error instanceof Error ? error.message : 'Error al eliminar usuario', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <UserHeader handleOpenCreateDialog={handleOpenCreateDialog} />
      <UserFilter
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setSearch={setSearch}
      />
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