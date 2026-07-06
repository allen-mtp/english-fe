'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axiosInstance from 'src/utils/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setUser(res.data.user ?? null);
      return res.data.user ?? null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(async (username, password) => {
    const res = await axiosInstance.post('/auth/login', { username, password });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (username, password, name) => {
    const res = await axiosInstance.post('/auth/register', { username, password, name });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      // ignore
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
