import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  School as SchoolIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const features = [
    {
      icon: <SecurityIcon />,
      title: 'Secure Access',
      description: 'OTP based login system',
      details: 'Advanced security with email-based OTP verification for secure document access'
    },
    {
      icon: <PaymentIcon />,
      title: 'One-Time Payment',
      description: 'Pay $30 and unlock forever',
      details: 'Single payment of $30 provides lifetime access to all premium features'
    },
    {
      icon: <SchoolIcon />,
      title: 'Structured Learning',
      description: 'Full Stack + DSA roadmap',
      details: 'Complete learning path covering MERN stack, system design, and data structures'
    }
  ];

  const technologies = [
    { name: 'JavaScript', description: 'Build a strong foundation with core JavaScript concepts' },
    { name: 'React.js', description: 'Build dynamic and interactive UI using modern React concepts' },
    { name: 'Next.js', description: 'Master server-side rendering (SSR), static site generation (SSG)' },
    { name: 'Node.js & Express', description: 'Build scalable backend systems with REST APIs' },
    { name: 'MongoDB', description: 'Learn NoSQL database design, schema structuring' },
    { name: 'Redux', description: 'Manage complex application state using Redux Toolkit' },
    { name: 'Data Structures & Algorithms', description: 'Master problem solving with arrays, trees, graphs' }
  ];

  const policies = [
    {
      icon: <LockIcon />,
      title: 'Access & Usage',
      description: 'This platform provides premium educational content for Full Stack Development and DSA. Access is granted only to authenticated users.',
      type: 'info'
    },
    {
      icon: <PaymentIcon />,
      title: 'Payment Policy',
      description: 'A one-time payment of $30 is required to unlock all content. This payment provides lifetime access to the platform.',
      type: 'success'
    },
    {
      icon: <WarningIcon />,
      title: 'No Refund Policy',
      description: 'All payments are strictly non-refundable under any circumstances once access is granted.',
      type: 'warning'
    },
    {
      icon: <PersonIcon />,
      title: 'User Responsibility',
      description: 'Users must not share, distribute, or misuse the content. Any violation may result in permanent account suspension.',
      type: 'error'
    },
    {
      icon: <GavelIcon />,
      title: 'Service Changes',
      description: 'We reserve the right to modify, update, or discontinue any part of the service without prior notice.',
      type: 'info'
    }
  ];

  const getPolicyColor = (type) => {
    const colors = {
      info: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    };
    return colors[type] || colors.info;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 2 }}>
        {/* Already Premium Alert */}
        {(user?.isPremium || user?.role === 'admin') && (
          <Alert
            severity="success"
            icon={<StarIcon />}
            sx={{
              mb: 4,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              You have Premium Access! 🎉
            </Typography>
            <Typography variant="body2">
              You can view and download all documents. Go to{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/app/dashboard')}
                sx={{ color: 'white', textDecoration: 'underline', p: 0, minWidth: 'auto' }}
              >
                Dashboard
              </Button>
              {' '}to explore.
            </Typography>
          </Alert>
        )}

        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Learn Full Stack & DSA
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Master MERN stack, system design, and Data Structures & Algorithms with premium structured content.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
            {!user?.isPremium && user?.role !== 'admin' ? (
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                }}
              >
                Get Access - ₹30
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/app/dashboard')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                Go to Dashboard
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/app/dashboard')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderColor: '#8B5CF6',
                color: '#8B5CF6'
              }}
            >
              View Docs
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            mb: 4,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Complete Learning Stack
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(139, 92, 246, 0.3)'
                  }
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.details}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Technologies Section */}
        <Card sx={{ mb: 6 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Technologies You'll Master
            </Typography>
            <Grid container spacing={3}>
              {technologies.map((tech, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={tech.name}
                        sx={{
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {tech.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Terms & Policy Section */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                mb: 4,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Terms & Policy
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
              By accessing this platform, you agree to the following terms and conditions.
            </Typography>

            <Grid container spacing={3}>
              {policies.map((policy, index) => (
                <Grid item xs={12} key={index}>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
                      border: `1px solid ${getPolicyColor(policy.type)}40`,
                      borderLeft: `4px solid ${getPolicyColor(policy.type)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: `${getPolicyColor(policy.type)}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: getPolicyColor(policy.type),
                          flexShrink: 0
                        }}
                      >
                        {policy.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            color: getPolicyColor(policy.type)
                          }}
                        >
                          {policy.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {policy.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                }}
              >
                Get Premium Access - $30
              </Button>
              
              <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  © 2026 Nexaura IT Solutions. All rights reserved.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="text"
                    size="small"
                    href="https://www.nexaurait.online/"
                    target="_blank"
                    sx={{ color: '#8B5CF6' }}
                  >
                    Company Website
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    href="https://www.linkedin.com/company/114344571/"
                    target="_blank"
                    sx={{ color: '#8B5CF6' }}
                  >
                    LinkedIn
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Premium;