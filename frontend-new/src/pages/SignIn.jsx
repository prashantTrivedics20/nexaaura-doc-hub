import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Divider,
  Stack,
  Fade,
  Grow,
  LinearProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Login as LoginIcon,
  PersonAdd as SignUpIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  ArrowBack as BackIcon,
  Rocket as RocketIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { login, register: registerUser } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [registrationData, setRegistrationData] = useState(null); // Store registration data

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const steps = isLogin 
    ? ['Enter Email', 'Verify OTP']
    : ['Enter Details', 'Verify Email', 'Complete Registration'];

  const handleEmailSubmit = async (data) => {
    setLoading(true);
    try {
      // Store registration data for later use
      if (!isLogin) {
        setRegistrationData({
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName
        });
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          purpose: isLogin ? 'login' : 'registration'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setUserEmail(data.email);
        setOtpSent(true);
        setActiveStep(isLogin ? 1 : 1);
        enqueueSnackbar('Verification code sent to your email', { variant: 'success' });
      } else {
        enqueueSnackbar(result.message || 'Failed to send verification code', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (data) => {
    setLoading(true);
    try {
      const payload = {
        email: userEmail,
        otp: data.otp,
        purpose: isLogin ? 'login' : 'registration'
      };

      if (!isLogin && registrationData) {
        payload.username = registrationData.username;
        payload.password = registrationData.password;
        payload.firstName = registrationData.firstName;
        payload.lastName = registrationData.lastName;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        if (isLogin) {
          // For login, save token and user data
          await login(result.token, result.user);
          enqueueSnackbar('Login successful!', { variant: 'success' });
          navigate('/app/dashboard');
        } else {
          // For registration, save token and user data
          await registerUser(result.token, result.user);
          enqueueSnackbar('Registration successful!', { variant: 'success' });
          navigate('/app/dashboard');
        }
      } else {
        enqueueSnackbar(result.message || 'Verification failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      enqueueSnackbar('Network error. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setActiveStep(0);
    setOtpSent(false);
    setUserEmail('');
    setRegistrationData(null); // Clear registration data
    reset();
  };

  const handleResendOtp = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          purpose: isLogin ? 'login' : 'registration'
        }),
      });

      if (response.ok) {
        enqueueSnackbar('New verification code sent', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to resend code', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        background: `
          radial-gradient(circle at 20% 20%, #8B5CF6 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, #EC4899 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, #10B981 0%, transparent 50%)
        `,
        animation: 'pulse 4s ease-in-out infinite'
      }} />

      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* Left Side - Branding */}
            <Box sx={{ 
              flex: 1, 
              display: { xs: 'none', md: 'block' },
              textAlign: 'center'
            }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: 4,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    mx: 'auto',
                    mb: 3,
                    fontSize: '2rem'
                  }}
                >
                  🚀
                </Avatar>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 2
                  }}
                >
                  Nexaura
                </Typography>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Developer Hub
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  Join thousands of developers accessing premium educational content. 
                  Master Full Stack Development and Data Structures & Algorithms.
                </Typography>
                
                <Stack spacing={2}>
                  {[
                    { icon: '📚', text: '500+ Learning Resources' },
                    { icon: '💻', text: '50+ Code Examples' },
                    { icon: '🎯', text: 'Interview Preparation' },
                    { icon: '⚡', text: 'Instant Access' }
                  ].map((feature, index) => (
                    <Grow in timeout={1000 + index * 200} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">{feature.icon}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.text}
                        </Typography>
                      </Box>
                    </Grow>
                  ))}
                </Stack>
              </Paper>
            </Box>

            {/* Right Side - Auth Form */}
            <Box sx={{ flex: 1 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(22, 33, 62, 0.8) 0%, rgba(26, 26, 46, 0.8) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Card Header Decoration */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)'
                  }}
                />

                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {isLogin ? <LoginIcon sx={{ fontSize: 30 }} /> : <SignUpIcon sx={{ fontSize: 30 }} />}
                    </Avatar>
                    
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {isLogin ? 'Welcome Back!' : 'Join Nexaura'}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {isLogin 
                        ? 'Sign in to continue your learning journey' 
                        : 'Create your account and start learning'
                      }
                    </Typography>

                    <Chip
                      icon={<SecurityIcon />}
                      label="Secure OTP Authentication"
                      size="small"
                      sx={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#8B5CF6',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    />
                  </Box>

                  {/* Progress Indicator */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Step {activeStep + 1} of {steps.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8B5CF6', fontWeight: 600 }}>
                        {Math.round(((activeStep + 1) / steps.length) * 100)}%
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={((activeStep + 1) / steps.length) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
                          borderRadius: 3
                        }
                      }}
                    />
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {steps[activeStep]}
                    </Typography>
                  </Box>

                  {/* Forms */}
                  <form onSubmit={handleSubmit(activeStep === 0 ? handleEmailSubmit : handleOtpVerify)}>
                    {/* Step 1: Email/Registration Details */}
                    {activeStep === 0 && (
                      <Fade in timeout={600}>
                        <Box>
                          {!isLogin && (
                            <Grow in timeout={800}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                                  <PersonIcon sx={{ mr: 1, color: '#8B5CF6' }} />
                                  Personal Information
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                  <TextField
                                    fullWidth
                                    label="First Name"
                                    {...register('firstName', { required: !isLogin })}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                        '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                                        '&.Mui-focused': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                                      }
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <PersonIcon sx={{ color: '#8B5CF6' }} />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    label="Last Name"
                                    {...register('lastName')}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                        '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                                        '&.Mui-focused': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                                      }
                                    }}
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <PersonIcon sx={{ color: '#8B5CF6' }} />
                                        </InputAdornment>
                                      ),
                                    }}
                                  />
                                </Box>

                                <TextField
                                  fullWidth
                                  label="Username"
                                  {...register('username', { 
                                    required: !isLogin ? 'Username is required' : false,
                                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                                  })}
                                  error={!!errors.username}
                                  helperText={errors.username?.message}
                                  sx={{ 
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                      '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                                      '&.Mui-focused': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                                    }
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <PersonIcon sx={{ color: '#8B5CF6' }} />
                                      </InputAdornment>
                                    ),
                                  }}
                                />

                                <TextField
                                  fullWidth
                                  label="Password"
                                  type={showPassword ? 'text' : 'password'}
                                  {...register('password', { 
                                    required: !isLogin ? 'Password is required' : false,
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                  })}
                                  error={!!errors.password}
                                  helperText={errors.password?.message}
                                  sx={{ 
                                    mb: 4,
                                    '& .MuiOutlinedInput-root': {
                                      backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                      '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                                      '&.Mui-focused': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                                    }
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <LockIcon sx={{ color: '#8B5CF6' }} />
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          onClick={() => setShowPassword(!showPassword)}
                                          edge="end"
                                          sx={{ color: '#8B5CF6' }}
                                        >
                                          {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                />

                                <Divider sx={{ my: 3, borderColor: 'rgba(139, 92, 246, 0.2)' }} />
                              </Box>
                            </Grow>
                          )}

                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ mr: 1, color: '#8B5CF6' }} />
                            {isLogin ? 'Sign In' : 'Email Verification'}
                          </Typography>

                          <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{ 
                              mb: 3,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                                '&.Mui-focused': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                              }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon sx={{ color: '#8B5CF6' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Box>
                      </Fade>
                    )}

                    {/* Step 2: OTP Verification */}
                    {activeStep === 1 && (
                      <Fade in timeout={600}>
                        <Box>
                          <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Avatar
                              sx={{
                                width: 80,
                                height: 80,
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                mx: 'auto',
                                mb: 3
                              }}
                            >
                              <VerifiedIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                              Check Your Email
                            </Typography>
                          </Box>

                          <Alert 
                            severity="info" 
                            sx={{ 
                              mb: 3,
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              '& .MuiAlert-icon': { color: '#8B5CF6' }
                            }}
                          >
                            We've sent a 6-digit verification code to <strong>{userEmail}</strong>
                          </Alert>

                          <TextField
                            fullWidth
                            label="Verification Code"
                            placeholder="Enter 6-digit code"
                            {...register('otp', { 
                              required: 'Verification code is required',
                              pattern: {
                                value: /^\d{6}$/,
                                message: 'Please enter a valid 6-digit code'
                              }
                            })}
                            error={!!errors.otp}
                            helperText={errors.otp?.message}
                            sx={{ 
                              mb: 3,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' },
                                '&.Mui-focused': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                              }
                            }}
                            inputProps={{ 
                              maxLength: 6,
                              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SecurityIcon sx={{ color: '#8B5CF6' }} />
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Button
                              variant="text"
                              onClick={handleResendOtp}
                              disabled={loading}
                              startIcon={<SendIcon />}
                              sx={{ 
                                color: '#8B5CF6',
                                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                              }}
                            >
                              Resend Code
                            </Button>
                            
                            <Button
                              variant="text"
                              onClick={() => {
                                setActiveStep(0);
                                setOtpSent(false);
                              }}
                              startIcon={<BackIcon />}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.1)' }
                              }}
                            >
                              Back
                            </Button>
                          </Box>
                        </Box>
                      </Fade>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{ 
                        mb: 4, 
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
                          boxShadow: '0 12px 40px rgba(139, 92, 246, 0.6)',
                          transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                          background: 'rgba(139, 92, 246, 0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={24} color="inherit" />
                          <Typography>Processing...</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {activeStep === 0 && (
                            <>
                              <SendIcon />
                              {isLogin ? 'Send Verification Code' : 'Create Account & Send Code'}
                            </>
                          )}
                          {activeStep === 1 && (
                            <>
                              <CheckIcon />
                              Verify & Continue
                            </>
                          )}
                        </Box>
                      )}
                    </Button>

                    {/* Mode Switch */}
                    {activeStep === 0 && (
                      <Box sx={{ textAlign: 'center' }}>
                        <Divider sx={{ mb: 3, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                          <Chip 
                            label="OR" 
                            size="small"
                            sx={{ 
                              background: 'rgba(139, 92, 246, 0.1)',
                              color: '#8B5CF6',
                              border: '1px solid rgba(139, 92, 246, 0.3)'
                            }}
                          />
                        </Divider>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          onClick={handleModeSwitch}
                          startIcon={isLogin ? <SignUpIcon /> : <LoginIcon />}
                          sx={{ 
                            textTransform: 'none',
                            borderColor: '#8B5CF6',
                            color: '#8B5CF6',
                            fontWeight: 600,
                            px: 4,
                            '&:hover': {
                              borderColor: '#A78BFA',
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isLogin ? 'Create New Account' : 'Sign In Instead'}
                        </Button>
                      </Box>
                    )}
                  </form>

                  {/* Footer */}
                  <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <Typography variant="caption" color="text.secondary">
                      By continuing, you agree to our Terms of Service and Privacy Policy
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Fade>
      </Container>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </Box>
  );
};

export default SignIn;