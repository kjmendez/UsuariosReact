import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import type { UserType } from './type';
import { Box, Chip, IconButton, Stack, Tooltip, LinearProgress } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOn as ActiveIcon,
  ToggleOff as InactiveIcon,
} from '@mui/icons-material';
import type { GridSortModel } from '@mui/x-data-grid';

interface Props {
  users: UserType[];
  rowCount: number;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  handleDelete: (id: number) => void;
  handleToggleStatus: (id: number, active: boolean) => void;
  handleOpenEditDialog: (user: UserType) => void;
  loading?: boolean;
}

export const UserTabla = ({
  users,
  rowCount,
  paginationModel,
  setPaginationModel,
  setSortModel,
  sortModel,
  handleDelete,
  handleToggleStatus,
  handleOpenEditDialog,
  loading = false
}: Props) => {
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Usuario', flex: 1 },
    {
      field: 'active',
      headerName: 'Estado',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === true ? 'Activo' : 'Inactivo'}
          color={params.value === true ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha Creación',
      width: 180,
      valueFormatter: (params) => {
        if (!params?.value) return 'N/A';
        try {
          return new Date(params.value).toLocaleDateString();
        } catch (error) {
          return 'Fecha inválida';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      sortable: false,
      filterable: false,
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction={'row'} spacing={1}>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => handleOpenEditDialog(params.row)}
              disabled={loading}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={params.row.active ? 'Inactivar' : 'Activar'}>
            <IconButton
              size="small"
              color={params.row.active ? 'error' : 'success'}
              onClick={() => handleToggleStatus(params.row.id, params.row.active)}
              disabled={loading}
            >
              {params.row.active ? (
                <InactiveIcon fontSize="small" />
              ) : (
                <ActiveIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
              disabled={loading}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box height={545}>
      <DataGrid
        rows={users}
        columns={columns}
        rowCount={rowCount}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortingMode="server"
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        pageSizeOptions={[5, 10, 20]}
        disableColumnFilter
        loading={loading}
        slots={{
          loadingOverlay: LinearProgress,
        }}
      />
    </Box>
  );
};