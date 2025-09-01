import { useState, useEffect, useCallback } from 'react';
import { mockAuthService } from '../services/mockAuthService';
import type { UserType } from '../models';

export const useMockAuth = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockAuthService.getSession().then(session => {
      if (session) {
        setToken(session.token);
        setUser(session.user);
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user } = await mockAuthService.login(username, password);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await mockAuthService.logout();
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    loading,
  };
};
