import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Stack,
  Avatar,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon,
  Description as DocumentIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (tab === 0) {
        if (!formData.email || !formData.password) {
          setError('Please fill in all fields');
          return;
        }
        
        await login(formData.email, formData.password);
        navigate('/app/dashboard');
      } else {
        if (!formData.email || !formData.password || !formData.username || !formData.confirmPassword) {
          setError('Please fill in all fields');
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        
        await register(formData.username, formData.email, formData.password);
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha('#00bcd4', 0.05)} 0%, ${alpha('#9c27b0', 0.05)} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      position: 'relative',
    }}>
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#00bcd4', 0.1)} 0%, transparent 70%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha('#9c27b0', 0.1)} 0%, transparent 70%)`,
        }}
      />

      {/* Back Button */}
      <IconButton
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            bgcolor: '#ffffff',
            transform: 'translateX(-4px)',
          },
          transition: 'all 0.3s',
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            bgcolor: '#ffffff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#00bcd4',
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 24px ${alpha('#00bcd4', 0.3)}`,
              }}
            >
              <DocumentIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
              {tab === 0 ? 'Welcome back' : 'Create account'}
            </Typography>
            <Typography variant="body1" sx={{ color: '#616161' }}>
              {tab === 0 ? 'Sign in to continue to Document Hub' : 'Get started with Document Hub'}
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 4,
              '& .MuiTabs-indicator': {
                bgcolor: '#00bcd4',
                height: 3,
                borderRadius: 2,
              }
            }}
          >
            <Tab
              icon={<LoginIcon />}
              iconPosition="start"
              label="Sign In"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: tab === 0 ? '#00bcd4' : '#616161',
                '&.Mui-selected': { color: '#00bcd4' }
              }}
            />
            <Tab
              icon={<PersonAddIcon />}
              iconPosition="start"
              label="Sign Up"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: tab === 1 ? '#00bcd4' : '#616161',
                '&.Mui-selected': { color: '#00bcd4' }
              }}
            />
          </Tabs>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Register Fields */}
            {tab === 1 && (
              <TextField
                fullWidth
                name="username"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                autoComplete="username"
                sx={{ mb: 2 }}
              />
            )}

            {/* Email Field */}
            <TextField
              fullWidth
              name="email"
              type="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              sx={{ mb: 2 }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
              sx={{ mb: tab === 1 ? 2 : 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password Field */}
            {tab === 1 && (
              <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: '#00bcd4',
                boxShadow: `0 4px 12px ${alpha('#00bcd4', 0.3)}`,
                '&:hover': {
                  bgcolor: '#008ba3',
                  boxShadow: `0 6px 20px ${alpha('#00bcd4', 0.4)}`,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                tab === 0 ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: '#616161' }}>
              {tab === 0 ? "Don't have an account? " : "Already have an account? "}
              <Button
                variant="text"
                onClick={() => setTab(tab === 0 ? 1 : 0)}
                sx={{
                  color: '#00bcd4',
                  fontWeight: 600,
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                {tab === 0 ? 'Sign up' : 'Sign in'}
              </Button>
            </Typography>
          </Box>

          {/* Trust Indicators */}
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4, pt: 4, borderTop: '1px solid #e0e0e0' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                }}
              />
              <Typography variant="caption" sx={{ color: '#616161' }}>
                Secure
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                }}
              />
              <Typography variant="caption" sx={{ color: '#616161' }}>
                Fast
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                }}
              />
              <Typography variant="caption" sx={{ color: '#616161' }}>
                Reliable
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignIn;
