import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Stack,
  Paper,
  IconButton,
  Avatar,
  Chip,
  alpha,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CloudUpload as CloudIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <DocumentIcon sx={{ fontSize: 40 }} />,
      title: 'Vast Library',
      description: 'Access thousands of documents across multiple categories',
      color: '#00bcd4',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Storage',
      description: 'Enterprise-grade security for all your documents',
      color: '#4caf50',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Access',
      description: 'Quick search and instant document retrieval',
      color: '#ff9800',
    },
    {
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      title: 'Cloud Powered',
      description: 'Access your documents anywhere, anytime',
      color: '#9c27b0',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Users', icon: <PeopleIcon /> },
    { number: '50K+', label: 'Documents', icon: <DocumentIcon /> },
    { number: '99.9%', label: 'Uptime', icon: <TrendingIcon /> },
    { number: '4.9/5', label: 'Rating', icon: <StarIcon /> },
  ];

  const benefits = [
    'Unlimited document access',
    'Advanced search capabilities',
    'Organized by categories',
    'Download support',
    'Regular updates',
    'Premium support',
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Navigation */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <Avatar
                sx={{
                  bgcolor: '#00bcd4',
                  width: 44,
                  height: 44,
                }}
              >
                <DocumentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#212121', lineHeight: 1 }}>
                  Document Hub
                </Typography>
                <Typography variant="caption" sx={{ color: '#616161' }}>
                  Your Digital Library
                </Typography>
              </Box>
            </Stack>
            
            {!isMobile && (
              <Stack direction="row" spacing={2}>
                <Button
                  onClick={() => navigate('/signin')}
                  sx={{ color: '#616161', textTransform: 'none', fontWeight: 500 }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/signin')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#00bcd4',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { bgcolor: '#008ba3' }
                  }}
                >
                  Get Started
                </Button>
              </Stack>
            )}
            
            {isMobile && (
              <IconButton>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha('#00bcd4', 0.05)} 0%, ${alpha('#9c27b0', 0.05)} 100%)`,
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                icon={<VerifiedIcon />}
                label="Trusted by 10,000+ users worldwide"
                sx={{
                  mb: 3,
                  bgcolor: alpha('#00bcd4', 0.1),
                  color: '#00bcd4',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: alpha('#00bcd4', 0.3),
                  py: 2.5,
                }}
              />
              
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: '#212121',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Your Complete{' '}
                <Box component="span" sx={{ color: '#00bcd4' }}>
                  Document Hub
                </Box>
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  color: '#616161',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Access, organize, and manage all your documents in one powerful platform. 
                Built for professionals who value efficiency.
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/signin')}
                  sx={{
                    bgcolor: '#00bcd4',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: '#008ba3' }
                  }}
                >
                  Start Free Trial
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/app/dashboard')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: '#00bcd4',
                    color: '#00bcd4',
                    '&:hover': {
                      borderColor: '#008ba3',
                      bgcolor: alpha('#00bcd4', 0.05),
                    },
                  }}
                >
                  View Demo
                </Button>
              </Stack>
              
              <Grid container spacing={3}>
                {stats.map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Box sx={{ color: '#00bcd4' }}>{stat.icon}</Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#00bcd4' }}>
                          {stat.number}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#616161', fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 400,
                    borderRadius: 2,
                    bgcolor: alpha('#00bcd4', 0.05),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DocumentIcon sx={{ fontSize: 120, color: alpha('#00bcd4', 0.3) }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                mb: 2,
                color: '#00bcd4',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: 2,
              }}
            >
              POWERFUL FEATURES
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#212121',
              }}
            >
              Everything you need
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#616161',
                fontWeight: 400,
                maxWidth: 700,
                mx: 'auto',
              }}
            >
              Powerful tools designed to make document management effortless
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    textAlign: 'center',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${alpha(feature.color, 0.2)}`,
                      borderColor: feature.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(feature.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#212121' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#616161', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 10, bgcolor: alpha('#00bcd4', 0.03) }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',
                  mb: 2,
                  color: '#00bcd4',
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                WHY CHOOSE US
              </Typography>
              
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: '#212121',
                }}
              >
                Built for modern teams
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: '#616161',
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                }}
              >
                Join thousands of professionals who trust our platform for document management.
              </Typography>
              
              <Stack spacing={2}>
                {benefits.map((benefit, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: alpha('#4caf50', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                    </Box>
                    <Typography variant="body1" sx={{ color: '#212121', fontWeight: 500 }}>
                      {benefit}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signin')}
                sx={{
                  mt: 4,
                  bgcolor: '#00bcd4',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': { bgcolor: '#008ba3' }
                }}
              >
                Get Started Now
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 4,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha('#ff9800', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <StarIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff9800', mb: 2 }}>
                  4.9/5
                </Typography>
                <Typography variant="h6" sx={{ color: '#212121', mb: 3, fontWeight: 600 }}>
                  Average Rating
                </Typography>
                <Typography variant="body1" sx={{ color: '#616161', mb: 3 }}>
                  Based on 2,500+ reviews from satisfied users
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: alpha('#00bcd4', 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#616161', fontStyle: 'italic', mb: 2, lineHeight: 1.7 }}>
                    "This platform has completely transformed how we manage documents. 
                    Fast, reliable, and incredibly easy to use."
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#00bcd4', fontWeight: 600 }}>
                    Sarah Johnson, Product Manager
                  </Typography>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: '#00bcd4',
          color: '#ffffff',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Ready to get started?
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                fontWeight: 400,
                opacity: 0.95,
              }}
            >
              Join thousands of users managing their documents efficiently
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/signin')}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#00bcd4',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f5f7fa',
                  },
                }}
              >
                Start Free Trial
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/app/dashboard')}
                sx={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: alpha('#ffffff', 0.1),
                  },
                }}
              >
                View Demo
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, bgcolor: '#212121', color: '#ffffff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: '#00bcd4',
                    width: 40,
                    height: 40,
                  }}
                >
                  <DocumentIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Document Hub
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: '#9e9e9e', lineHeight: 1.7 }}>
                Your complete document management solution
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1}>
                {['Features', 'Pricing', 'Security', 'Updates'].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: '#9e9e9e',
                      cursor: 'pointer',
                      '&:hover': { color: '#00bcd4' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                {['About', 'Contact', 'Privacy', 'Terms'].map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      color: '#9e9e9e',
                      cursor: 'pointer',
                      '&:hover': { color: '#00bcd4' },
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #424242', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
              © 2024 Document Hub. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
