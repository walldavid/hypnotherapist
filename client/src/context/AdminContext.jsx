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
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin:', error);
      // Only logout if token is invalid (401), not for other errors
      if (error.response?.status === 401) {
        logout();
        setLoading(false);
      } else {
        // For other errors (network issues, etc.), keep the session alive
        // Set a minimal admin object from localStorage to maintain authentication
        const token = localStorage.getItem('adminToken');
        if (token) {
          // Decode the JWT to get admin info (basic decode without verification)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setAdmin({ 
              id: payload.id, 
              role: payload.role,
              username: 'admin' // Placeholder until we can reach the server
            });
          } catch (e) {
            console.error('Error decoding token:', e);
            logout();
          }
        }
        setLoading(false);
      }
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
