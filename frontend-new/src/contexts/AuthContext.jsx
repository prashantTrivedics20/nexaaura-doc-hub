import { createContext, useContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            sessionStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        sessionStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      sessionStorage.setItem('token', data.token);
      setUser(data.user);
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      return data;
    } catch (error) {
      enqueueSnackbar(error.message || 'Login failed', { variant: 'error' });
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      sessionStorage.setItem('token', data.token);
      setUser(data.user);
      enqueueSnackbar('Account created successfully!', { variant: 'success' });
      return data;
    } catch (error) {
      enqueueSnackbar(error.message || 'Registration failed', { variant: 'error' });
      throw error;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isPremium: user?.isPremium || user?.role === 'admin' || user?.role === 'premium',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};