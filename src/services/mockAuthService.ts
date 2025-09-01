import type { UserType } from '../models';

const STORAGE_KEY_TOKEN = 'mockToken';
const STORAGE_KEY_USER = 'mockAuthUser';

// Usuario simulado (puedes adaptarlo)
const defaultUser: UserType = {
  id: 1,
  username: 'admin',
  active: true,
  createdAt: new Date().toISOString(),
};

// Simular delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  login: async (username: string, password: string) => {
    await delay();

    // Aquí puedes poner lógica más compleja
    if ((username === 'admin' && password === '123456') || username.length > 2) {
      const token = 'mock-token-' + Date.now();
      const user = { ...defaultUser, username };

      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

      return { token, user };
    }

    throw new Error('Credenciales inválidas');
  },

  logout: async () => {
    await delay();
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    return true;
  },

  getSession: async () => {
    await delay();
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const user = localStorage.getItem(STORAGE_KEY_USER);
    if (token && user) {
      return { token, user: JSON.parse(user) as UserType };
    }
    return null;
  },
};
  