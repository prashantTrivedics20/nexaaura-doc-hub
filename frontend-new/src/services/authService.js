import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear session storage and redirect to signin
      sessionStorage.removeItem('token');
      authService.removeAuthToken();
      window.location.href = '/signin';
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

const authService = {
  // Set auth token in headers
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  // Send OTP for email verification
  sendOTP: async (email, purpose = 'login') => {
    const response = await api.post('/auth/send-otp', { email, purpose });
    return response.data;
  },

  // Verify OTP and complete authentication
  verifyOTP: async (email, otp, purpose = 'login', additionalData = {}) => {
    const response = await api.post('/auth/verify-otp', { 
      email, 
      otp, 
      purpose,
      ...additionalData 
    });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Reset password (send OTP)
  requestPasswordReset: async (email) => {
    return await authService.sendOTP(email, 'password_reset');
  },

  // Verify OTP for password reset
  verifyPasswordResetOTP: async (email, otp) => {
    const response = await authService.verifyOTP(email, otp, 'password_reset');
    return response;
  },

  // Reset password with token
  resetPassword: async (resetToken, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      resetToken,
      newPassword,
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    sessionStorage.removeItem('token');
    authService.removeAuthToken();
  },

  // Health check
  healthCheck: async () => {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
    return response.data;
  },
};

export default authService;