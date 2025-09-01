import type { UserType, UserFormValues, UserUpdateFormValues } from '../models';

const STORAGE_KEY = 'mockUsers';

// Datos iniciales de ejemplo
const initialUsers: UserType[] = [
  { id: 1, username: 'admin', active: true, createdAt: new Date().toISOString() },
  { id: 2, username: 'usuario1', active: true, createdAt: new Date().toISOString() },
  { id: 3, username: 'usuario2', active: false, createdAt: new Date().toISOString() },
];

// Obtener usuarios del localStorage o usar datos iniciales
const getUsers = (): UserType[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialUsers;
  } catch {
    return initialUsers;
  }
};

// Guardar usuarios en localStorage
const saveUsers = (users: UserType[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Simular delay de API
const delay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const mockUserService = {
  // Obtener usuarios con filtros
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
  }) => {
    await delay();

    let users = getUsers();

    // Aplicar filtro de búsqueda
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      users = users.filter(user => 
        user.username.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de estado
    if (params?.active !== undefined) {
      users = users.filter(user => user.active === params.active);
    }

    // Aplicar ordenamiento
    if (params?.orderBy) {
      users.sort((a, b) => {
        const aValue = a[params.orderBy as keyof UserType];
        const bValue = b[params.orderBy as keyof UserType];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return params.orderDir === 'desc' 
            ? bValue.localeCompare(aValue) 
            : aValue.localeCompare(bValue);
        }
        return 0;
      });
    }

    const total = users.length;
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Paginación
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Crear usuario
  createUser: async (userData: { username: string; password: string }) => {
    await delay();

    const users = getUsers();
    
    // Verificar si el usuario ya existe
    if (users.some(user => user.username === userData.username)) {
      throw new Error('El usuario ya existe');
    }

    const newUser: UserType = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username: userData.username,
      active: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
  },

  // Actualizar usuario
  updateUser: async (id: number, userData: UserUpdateFormValues) => {
    await delay();

    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar si el username ya existe (excluyendo el actual)
    if (users.some(user => user.username === userData.username && user.id !== id)) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    users[userIndex] = { ...users[userIndex], ...userData };
    saveUsers(users);

    return users[userIndex];
  },

  // Cambiar estado de usuario
  toggleUserStatus: async (id: number) => {
    await delay();

    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    users[userIndex].active = !users[userIndex].active;
    saveUsers(users);

    return users[userIndex];
  },

  // Eliminar usuario
  deleteUser: async (id: number) => {
    await delay();

    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    users.splice(userIndex, 1);
    saveUsers(users);

    return { message: 'Usuario eliminado correctamente' };
  },
};