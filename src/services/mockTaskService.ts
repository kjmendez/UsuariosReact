import type { TaskType } from '../components/tasks/type';

const STORAGE_KEY = 'mockTasks';

// Datos iniciales de ejemplo
const initialTasks: TaskType[] = [
  { id: 1, name: 'Configurar entorno React', done: false },
  { id: 2, name: 'Crear layout con Header y Footer', done: true },
  { id: 3, name: 'Implementar CRUD de usuarios', done: false },
];

// Obtener tareas del localStorage o usar datos iniciales
const getTasks = (): TaskType[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialTasks;
  } catch {
    return initialTasks;
  }
};

// Guardar tareas en localStorage
const saveTasks = (tasks: TaskType[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

// Simular delay de API
const delay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const mockTaskService = {
  // Obtener tareas con filtros
  getTasks: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    done?: boolean;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) => {
    await delay();

    let tasks = getTasks();

    // Filtro de búsqueda
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      tasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (params?.done !== undefined) {
      tasks = tasks.filter(task => task.done === params.done);
    }

    // Ordenamiento
    if (params?.orderBy) {
      tasks.sort((a, b) => {
        const aValue = a[params.orderBy as keyof TaskType];
        const bValue = b[params.orderBy as keyof TaskType];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return params.orderDir === 'desc'
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return params.orderDir === 'desc'
            ? Number(bValue) - Number(aValue)
            : Number(aValue) - Number(bValue);
        }
        return 0;
      });
    }

    const total = tasks.length;
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Paginación
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    return {
      data: paginatedTasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Crear tarea
  createTask: async (taskData: { name: string }) => {
    await delay();

    const tasks = getTasks();

    const newTask: TaskType = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      name: taskData.name,
      done: false,
    };

    tasks.push(newTask);
    saveTasks(tasks);

    return newTask;
  },

  // Actualizar tarea
  updateTask: async (id: number, taskData: { name: string }) => {
    await delay();

    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      throw new Error('Tarea no encontrada');
    }

    tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
    saveTasks(tasks);

    return tasks[taskIndex];
  },

  // Cambiar estado de tarea
  toggleTaskStatus: async (id: number) => {
    await delay();

    const tasks = getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex === -1) {
      throw new Error('Tarea no encontrada');
    }

    tasks[taskIndex].done = !tasks[taskIndex].done;
    saveTasks(tasks);

    return tasks[taskIndex];
  },

  // Eliminar tarea
  deleteTask: async (id: number) => {
    await delay();

    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== id);

    saveTasks(tasks);
    return { message: 'Tarea eliminada correctamente' };
  },
};
