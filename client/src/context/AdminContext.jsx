import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('adminToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadAdmin();
    } else {
      setLoading(false);
    }
  }, []);

  const loadAdmin = async () => {
    try {
      const response = await api.get('/admin/me');
      setAdmin(response.data.admin);
    } catch (error) {
      console.error('Error loading admin:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/admin/login', { username, password });
      const { token, admin: adminData } = response.data;

      localStorage.setItem('adminToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAdmin(adminData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
