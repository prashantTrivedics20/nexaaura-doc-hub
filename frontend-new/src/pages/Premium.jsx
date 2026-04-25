import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar
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
  Gavel as GavelIcon,
  QrCode as QrCodeIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Wallet as WalletIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Premium = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const plans = [
    {
      id: 'lifetime',
      name: 'Lifetime Premium Access',
      price: 1,
      duration: 'Lifetime',
      popular: true,
      originalPrice: 100,
      savings: '₹99 saved',
      features: [
        'Access to all premium documents',
        'Unlimited downloads',
        'Priority support',
        'Ad-free experience',
        'Lifetime access - Pay once, use forever',
        'All future content included',
        'Full Stack Development resources',
        'Data Structures & Algorithms content',
      ]
    }
  ];

  const paymentMethods = [
    { icon: <QrCodeIcon />, name: 'UPI / QR Code', description: 'Google Pay, PhonePe, Paytm' },
    { icon: <CardIcon />, name: 'Cards', description: 'Credit/Debit Cards' },
    { icon: <BankIcon />, name: 'Net Banking', description: 'All major banks' },
    { icon: <WalletIcon />, name: 'Wallets', description: 'Paytm, PhonePe, etc.' },
  ];

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
      description: 'Pay ₹1 and unlock forever',
      details: 'Single payment of ₹1 provides lifetime access to all premium features and future content'
    },
    {
      icon: <SchoolIcon />,
      title: 'Complete Learning Path',
      description: 'Full Stack + DSA roadmap',
      details: 'Complete learning path covering MERN stack, system design, and data structures with lifetime updates'
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
      description: 'One-time payment of ₹1 provides lifetime access to all content. All payments are processed securely through Razorpay with multiple payment options.',
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please login to continue', severity: 'error' });
      navigate('/signin');
      return;
    }

    setSelectedPlan(plan);
    setOpenDialog(true);
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setOpenDialog(false);

      console.log('🔄 Starting payment process for plan:', selectedPlan);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Get token from session storage
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('🔑 Token found, creating order...');

      // Create order
      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType: selectedPlan.id })
      });

      console.log('📡 Order creation response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Order creation failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const orderData = await response.json();

      console.log('📦 Order created successfully:', orderData);

      // Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Nexaura IT Solutions',
        description: `${selectedPlan.name} - Premium Access`,
        image: '/favicon.svg',
        order_id: orderData.orderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#8B5CF6'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setSnackbar({ open: true, message: 'Payment cancelled', severity: 'info' });
          }
        },
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${API_URL}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            // Update user context
            if (updateUser) {
              updateUser({ 
                ...user, 
                isPremium: true, 
                premiumExpiresAt: verifyData.premiumExpiresAt 
              });
            }

            setSnackbar({ 
              open: true, 
              message: '🎉 Payment successful! You now have premium access!', 
              severity: 'success' 
            });

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              navigate('/app/dashboard');
            }, 2000);

          } catch (error) {
            console.error('Payment verification error:', error);
            setSnackbar({ 
              open: true, 
              message: 'Payment verification failed. Please contact support.', 
              severity: 'error' 
            });
          } finally {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Payment failed. Please try again.', 
        severity: 'error' 
      });
      setLoading(false);
    }
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
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
            Master MERN stack, system design, and Data Structures & Algorithms with premium structured content.
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4, 
              fontWeight: 700, 
              color: '#10B981',
              textShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
            }}
          >
            🎉 Special Launch Offer: Only ₹1 for Lifetime Access!
          </Typography>
        </Box>

        {/* Pricing Plans */}
        {!user?.isPremium && user?.role !== 'admin' && (
          <Box sx={{ mb: 6 }}>
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
              Lifetime Access - Pay Once, Learn Forever
            </Typography>

            <Grid container spacing={4} sx={{ mb: 4, justifyContent: 'center' }}>
              {plans.map((plan) => (
                <Grid item xs={12} md={8} lg={6} key={plan.id}>
                  <Card
                    sx={{
                      height: '100%',
                      position: 'relative',
                      border: '3px solid #10B981',
                      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)'
                      }
                    }}
                  >
                    <Chip
                      label="🔥 LIMITED TIME OFFER"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                    <CardContent sx={{ p: 4, pt: 6 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                        {plan.name}
                      </Typography>
                      
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              textDecoration: 'line-through', 
                              color: 'text.secondary',
                              mr: 2
                            }}
                          >
                            ₹{plan.originalPrice}
                          </Typography>
                          <Typography variant="h2" sx={{ fontWeight: 900, color: '#10B981' }}>
                            ₹{plan.price}
                          </Typography>
                        </Box>
                        <Chip
                          label={plan.savings}
                          sx={{
                            mb: 2,
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1rem'
                          }}
                        />
                        <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 600 }}>
                          {plan.duration} • One-time payment
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 4 }}>
                        {plan.features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CheckIcon sx={{ color: '#10B981', mr: 2, fontSize: 24 }} />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => handlePayment(plan)}
                        disabled={loading}
                        sx={{
                          py: 2,
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                          }
                        }}
                      >
                        🚀 Get Lifetime Access - ₹1
                      </Button>

                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 2, 
                          color: 'text.secondary' 
                        }}
                      >
                        ⚡ Instant access • 🔒 Secure payment • 💯 No hidden charges
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Payment Methods */}
            <Card sx={{ mb: 6, background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  Multiple Payment Options Available
                </Typography>
                <Grid container spacing={3}>
                  {paymentMethods.map((method, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#8B5CF6',
                            background: 'rgba(139, 92, 246, 0.05)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {method.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ textAlign: 'center', mt: 3 }}
                >
                  🔒 Secure payments powered by Razorpay
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

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

            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
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
          </CardContent>
        </Card>
      </Box>

      {/* Payment Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => !loading && setOpenDialog(false)}>
        <DialogTitle>
          Confirm Payment
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are about to purchase:
              </Typography>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  mb: 2
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedPlan.name}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6', mb: 1 }}>
                  ₹{selectedPlan.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valid for {selectedPlan.duration}
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                You can pay using UPI, Cards, Net Banking, or Wallets
              </Alert>
              <Typography variant="body2" color="text.secondary">
                By proceeding, you agree to our terms and conditions. All payments are non-refundable.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={initiatePayment}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              minWidth: 120
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Proceed to Pay'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#8B5CF6', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white' }}>
              Processing Payment...
            </Typography>
          </Box>
        </Box>
      )}
      
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Container>
  );
};

export default Premium;
