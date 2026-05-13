import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token  = localStorage.getItem('auth_token');
    const cached = localStorage.getItem('auth_user');

    if (token && cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        localStorage.removeItem('auth_user');
      }
      // Verify token is still valid
      authAPI.me()
        .then(({ data }) => {
          setUser(data);
          localStorage.setItem('auth_user', JSON.stringify(data));
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  const isAdmin    = user?.role === 'admin';
  const isStaff    = user?.role === 'staff';
  const isCustomer = user?.role === 'customer';
  const isAdminOrStaff = isAdmin || isStaff;

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAdmin, isStaff, isCustomer, isAdminOrStaff,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
