import { createContext, useContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import authService from '../services/authService';

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

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          authService.setAuthToken(token);
          const userData = await authService.getProfile();
          setUser(userData.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        sessionStorage.removeItem('token');
        authService.removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (token, userData) => {
    sessionStorage.setItem('token', token);
    authService.setAuthToken(token);
    setUser(userData);
  };

  const register = async (token, userData) => {
    sessionStorage.setItem('token', token);
    authService.setAuthToken(token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    authService.removeAuthToken();
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