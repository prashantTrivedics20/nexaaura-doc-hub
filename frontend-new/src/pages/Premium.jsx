import { useState, useEffect } from 'react';
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
  Snackbar,
  Stack,
  alpha,
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
  Wallet as WalletIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Premium = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [freeAccessEnabled, setFreeAccessEnabled] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    checkAdminSettings();
  }, []);

  const checkAdminSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings/public/free-access`);
      if (response.ok) {
        const data = await response.json();
        setFreeAccessEnabled(data.freeAccessEnabled || false);
      }
    } catch (error) {
      console.error('Error checking admin settings:', error);
      setFreeAccessEnabled(false);
    }
  };

  const plans = [
    {
      id: 'lifetime',
      name: 'Lifetime Premium',
      price: 1,
      duration: 'Lifetime',
      originalPrice: 100,
      savings: '₹99 saved',
      features: [
        'Access to all premium documents',
        'Unlimited downloads',
        'Priority support',
        'Ad-free experience',
        'Lifetime access',
        'All future content included',
      ]
    }
  ];

  const paymentMethods = [
    { icon: <QrCodeIcon />, name: 'UPI / QR', description: 'Google Pay, PhonePe' },
    { icon: <CardIcon />, name: 'Cards', description: 'Credit/Debit' },
    { icon: <BankIcon />, name: 'Net Banking', description: 'All banks' },
    { icon: <WalletIcon />, name: 'Wallets', description: 'Paytm, PhonePe' },
  ];

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Access',
      description: 'Advanced security with email verification'
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      title: 'One-Time Payment',
      description: 'Pay once, access forever'
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Complete Library',
      description: 'Full access to all documents'
    }
  ];

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

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType: selectedPlan.id })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const orderData = await response.json();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Document Hub',
        description: `${selectedPlan.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#00bcd4'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setSnackbar({ open: true, message: 'Payment cancelled', severity: 'info' });
          }
        },
        handler: async (response) => {
          try {
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

            if (updateUser) {
              updateUser({ 
                ...user, 
                isPremium: true, 
                premiumExpiresAt: verifyData.premiumExpiresAt 
              });
            }

            setSnackbar({ 
              open: true, 
              message: 'Payment successful! You now have premium access!', 
              severity: 'success' 
            });

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
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: 'calc(100vh - 64px)', py: 6 }}>
      <Container maxWidth="lg">
        {/* Free Access Alert */}
        {freeAccessEnabled && (
          <Alert
            severity="success"
            icon={<LockIcon />}
            sx={{ mb: 4 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Free Access Enabled!
            </Typography>
            <Typography variant="body2">
              All documents are currently free. Go to{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/app/dashboard')}
                sx={{ p: 0, minWidth: 'auto', textDecoration: 'underline' }}
              >
                Dashboard
              </Button>
              {' '}to explore.
            </Typography>
          </Alert>
        )}

        {/* Already Premium Alert */}
        {(user?.isPremium || user?.role === 'admin') && !freeAccessEnabled && (
          <Alert
            severity="success"
            icon={<StarIcon />}
            sx={{ mb: 4 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              You have Premium Access!
            </Typography>
            <Typography variant="body2">
              Go to{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/app/dashboard')}
                sx={{ p: 0, minWidth: 'auto', textDecoration: 'underline' }}
              >
                Dashboard
              </Button>
              {' '}to explore all documents.
            </Typography>
          </Alert>
        )}

        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            icon={<RocketIcon />}
            label="LIMITED TIME OFFER"
            sx={{
              mb: 3,
              bgcolor: '#ff6b6b',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          />
          
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: '#212121',
            }}
          >
            Unlock Premium Access
          </Typography>
          
          <Typography variant="h5" sx={{ mb: 3, color: '#616161', maxWidth: 700, mx: 'auto' }}>
            Get lifetime access to all documents for just ₹1
          </Typography>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#4caf50',
            }}
          >
            Special Launch Offer: Only ₹1!
          </Typography>
        </Box>

        {/* Pricing Plan */}
        {!freeAccessEnabled && !user?.isPremium && user?.role !== 'admin' && (
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={4} sx={{ mb: 4, justifyContent: 'center' }}>
              {plans.map((plan) => (
                <Grid item xs={12} md={8} lg={6} key={plan.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '2px solid #00bcd4',
                      position: 'relative',
                    }}
                  >
                    <Chip
                      label="BEST VALUE"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: '#ff6b6b',
                        color: '#ffffff',
                        fontWeight: 600,
                      }}
                    />
                    
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                        {plan.name}
                      </Typography>
                      
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              textDecoration: 'line-through', 
                              color: '#9e9e9e',
                            }}
                          >
                            ₹{plan.originalPrice}
                          </Typography>
                          <Typography variant="h2" sx={{ fontWeight: 900, color: '#00bcd4' }}>
                            ₹{plan.price}
                          </Typography>
                        </Stack>
                        
                        <Chip
                          label={plan.savings}
                          sx={{
                            mb: 2,
                            bgcolor: alpha('#4caf50', 0.1),
                            color: '#4caf50',
                            fontWeight: 600,
                            border: '1px solid',
                            borderColor: alpha('#4caf50', 0.3),
                          }}
                        />
                        
                        <Typography variant="h6" sx={{ color: '#616161', fontWeight: 500 }}>
                          {plan.duration} • One-time payment
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 4 }}>
                        {plan.features.map((feature, index) => (
                          <Stack key={index} direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: alpha('#4caf50', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CheckIcon sx={{ color: '#4caf50', fontSize: 16 }} />
                            </Box>
                            <Typography variant="body1">
                              {feature}
                            </Typography>
                          </Stack>
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
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          bgcolor: '#00bcd4',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#008ba3',
                          }
                        }}
                      >
                        Get Lifetime Access - ₹1
                      </Button>

                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          textAlign: 'center', 
                          mt: 2, 
                          color: '#9e9e9e' 
                        }}
                      >
                        Instant access • Secure payment • No hidden charges
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Payment Methods */}
            <Card elevation={0} sx={{ mb: 6, border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  Multiple Payment Options
                </Typography>
                <Grid container spacing={3}>
                  {paymentMethods.map((method, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            borderColor: '#00bcd4',
                            bgcolor: alpha('#00bcd4', 0.05),
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: alpha('#00bcd4', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1,
                            color: '#00bcd4',
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {method.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#616161' }}>
                          {method.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Typography 
                  variant="body2" 
                  sx={{ textAlign: 'center', mt: 3, color: '#616161' }}
                >
                  Secure payments powered by Razorpay
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
            color: '#212121',
          }}
        >
          Why Choose Premium?
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    borderColor: '#00bcd4',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha('#00bcd4', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: '#00bcd4',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#616161' }}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Payment Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to purchase {selectedPlan?.name} for ₹{selectedPlan?.price}.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: '#616161' }}>
            This is a one-time payment for lifetime access.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={initiatePayment} 
            variant="contained"
            disabled={loading}
            sx={{ bgcolor: '#00bcd4' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Proceed to Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default Premium;
