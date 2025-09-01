import { Box } from '@mui/material';
import {
  TaskDialog,
  TaskFilter,
  TaskHeader,
  TaskTabla,
  type TaskActionState,
} from '../../components';
import { useEffect, useState } from 'react';
import type { TaskType, TaskFilterDoneType } from '../../components/tasks/type';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useAlert, useAxios } from '../../hooks';
import { errorHelper, hanleZodError } from '../../helpers';
import { schemaTask, type TaskFormValues } from '../../models';

export const TasksPage = () => {
  const { showAlert } = useAlert();
  const axios = useAxios();

  const [filterStatus, setFilterStatus] = useState<TaskFilterDoneType>('all');
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0, // ojo: DataGrid empieza en 0
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [task, setTask] = useState<TaskType | null>(null);

  useEffect(() => {
    listTasksApi();
  }, [search, filterStatus, paginationModel, sortModel]);

  const listTasksApi = async () => {
    try {
      const orderBy = sortModel[0]?.field;
      const orderDir = sortModel[0]?.sort;
      const response = await axios.get('/tasks', {
        params: {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy,
          orderDir,
          search,
          done: filterStatus === 'all' ? undefined : filterStatus === 'true',
        },
      });
      setTasks(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setOpenDialog(true);
    setTask(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTask(null);
  };

  const handleOpenEditDialog = (task: TaskType) => {
    setOpenDialog(true);
    setTask(task);
  };

  const handleCreateEdit = async (
    _: TaskActionState | undefined,
    formData: FormData
  ) => {
    const rawData = {
      name: formData.get('name') as string,
    };

    try {
      schemaTask.parse(rawData);
      if (task) {
        await axios.put(`/tasks/${task.id}`, rawData);
        showAlert('Tarea actualizada', 'success');
      } else {
        await axios.post('/tasks', rawData);
        showAlert('Tarea creada', 'success');
      }
      listTasksApi();
      handleCloseDialog();
      return;
    } catch (error) {
      const err = hanleZodError<TaskFormValues>(error, rawData);
      showAlert(err.message, 'error');
      return err;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const confirmed = window.confirm('¿Estás seguro de eliminar esta tarea?');
      if (!confirmed) return;
      await axios.delete(`/tasks/${id}`);
      showAlert('Tarea eliminada', 'success');
      listTasksApi();
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  const handleDone = async (id: number, done: boolean) => {
    try {
      await axios.patch(`/tasks/${id}`, { done: !done });
      showAlert(`Tarea marcada como ${done ? 'pendiente' : 'hecha'}`, 'success');
      listTasksApi();
    } catch (error) {
      showAlert(errorHelper(error), 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TaskHeader handleOpenCreateDialog={handleOpenCreateDialog} />
      <TaskFilter
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setSearch={setSearch}
      />
      <TaskTabla
        tasks={tasks}
        rowCount={total}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        handleDelete={handleDelete}
        handleDone={handleDone}
        handleOpenEditDialog={handleOpenEditDialog}
      />
      <TaskDialog
        open={openDialog}
        task={task}
        onClose={handleCloseDialog}
        handleCreateEdit={handleCreateEdit}
      />
    </Box>
  );
};
