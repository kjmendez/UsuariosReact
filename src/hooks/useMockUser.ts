import { useState, useCallback } from 'react';
import { mockUserService } from '../services/mockUserService';
import type { UserType, UserFormValues, UserUpdateFormValues } from '../models';

export const useMockUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mockUserService.getUsers(params);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const user = await mockUserService.createUser(userData);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: number, userData: UserUpdateFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const user = await mockUserService.updateUser(id, userData);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const user = await mockUserService.toggleUserStatus(id);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mockUserService.deleteUser(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
  };
};