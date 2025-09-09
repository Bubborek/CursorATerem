import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserAuthContext = createContext();

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Decode JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          memberId: payload.memberId,
          email: payload.email,
          username: payload.username,
          first_name: payload.first_name,
          last_name: payload.last_name
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
      
      // Verify token is still valid
      api.get('/api/health')
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('userToken');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/user/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('userToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/user/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('userToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
};
