import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Snackbar,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, setting: null, value: null });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Default settings configuration
  const settingsConfig = {
    free_document_access: {
      label: 'Free Document Access',
      description: 'Allow all authenticated users to view and download documents without premium subscription',
      type: 'boolean',
      icon: <LockOpenIcon />,
      category: 'Access Control',
      requiresConfirmation: true,
      confirmMessage: 'This will affect all users immediately. Are you sure?'
    },
    maintenance_mode: {
      label: 'Maintenance Mode',
      description: 'Put the system in maintenance mode (only admins can access)',
      type: 'boolean',
      icon: <SettingsIcon />,
      category: 'System',
      requiresConfirmation: true,
      confirmMessage: 'This will block all non-admin users from accessing the system.'
    },
    registration_enabled: {
      label: 'User Registration',
      description: 'Allow new users to register accounts',
      type: 'boolean',
      icon: <SecurityIcon />,
      category: 'Access Control',
      requiresConfirmation: false
    },
    payment_required: {
      label: 'Payment Required',
      description: 'Require payment for premium features (when free access is disabled)',
      type: 'boolean',
      icon: <PaymentIcon />,
      category: 'Payment',
      requiresConfirmation: false
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || {});
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load settings', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingKey, value) => {
    const config = settingsConfig[settingKey];
    
    if (config?.requiresConfirmation) {
      setConfirmDialog({
        open: true,
        setting: settingKey,
        value: value,
        message: config.confirmMessage
      });
    } else {
      updateSetting(settingKey, value);
    }
  };

  const updateSetting = async (settingKey, value) => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem('token');
      const config = settingsConfig[settingKey];
      
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: settingKey,
          value: value,
          description: config?.description || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setSettings(prev => ({
          ...prev,
          [settingKey]: {
            value: value,
            description: config?.description || '',
            updatedAt: new Date().toISOString()
          }
        }));

        setSnackbar({ 
          open: true, 
          message: `${config?.label || settingKey} updated successfully`, 
          severity: 'success' 
        });
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update setting', 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
      setConfirmDialog({ open: false, setting: null, value: null });
    }
  };

  const handleConfirmChange = () => {
    if (confirmDialog.setting && confirmDialog.value !== null) {
      updateSetting(confirmDialog.setting, confirmDialog.value);
    }
  };

  const getSettingValue = (key, defaultValue = false) => {
    return settings[key]?.value ?? defaultValue;
  };

  const groupedSettings = Object.entries(settingsConfig).reduce((acc, [key, config]) => {
    const category = config.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, config });
    return acc;
  }, {});

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#00bcd4', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#00bcd4', fontWeight: 600 }}>
          Loading Settings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
          color: 'white',
          p: 4,
          mb: 3,
          borderRadius: 0,
          boxShadow: '0 4px 20px rgba(0, 188, 212, 0.3)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <SettingsIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                System Settings
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Configure system-wide settings and access controls
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
            disabled={loading}
            sx={{
              bgcolor: 'white',
              color: '#00bcd4',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              },
              transition: 'all 0.2s'
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: 4 }}>
        {/* Current Status Alert */}
        <Alert 
          severity={getSettingValue('free_document_access') ? 'success' : 'warning'} 
          icon={getSettingValue('free_document_access') ? <LockOpenIcon /> : <LockIcon />}
          sx={{ 
            mb: 4,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Current Access Mode: {getSettingValue('free_document_access') ? 'FREE ACCESS' : 'PREMIUM REQUIRED'}
              </Typography>
              <Typography variant="body2">
                {getSettingValue('free_document_access') 
                  ? 'All authenticated users can view and download documents for free.'
                  : 'Users need premium subscription to view and download documents.'
                }
              </Typography>
            </Box>
            <Chip
              label={getSettingValue('free_document_access') ? 'ACTIVE' : 'RESTRICTED'}
              color={getSettingValue('free_document_access') ? 'success' : 'warning'}
              sx={{ 
                fontWeight: 700,
                fontSize: '0.875rem',
                height: 32
              }}
            />
          </Box>
        </Alert>

        {/* Settings by Category */}
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <Card 
            key={category} 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              border: '1px solid #e0e0e0'
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
                color: 'white',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {category}
                </Typography>
                <Chip 
                  label={`${categorySettings.length} ${categorySettings.length === 1 ? 'setting' : 'settings'}`} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    height: 24
                  }} 
                />
              </Box>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {categorySettings.map(({ key, config }) => (
                  <Grid item xs={12} key={key}>
                    <Box
                      sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: getSettingValue(key) ? '#00bcd4' : '#e0e0e0',
                        borderRadius: 2,
                        bgcolor: getSettingValue(key) ? '#e0f7fa' : '#ffffff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#00bcd4',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 188, 212, 0.2)'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            background: getSettingValue(key) 
                              ? 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)'
                              : 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: getSettingValue(key) 
                              ? '0 4px 12px rgba(0, 188, 212, 0.3)'
                              : '0 4px 12px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {config.icon}
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#212121' }}>
                              {config.label}
                            </Typography>
                            <Chip
                              label={getSettingValue(key) ? 'ENABLED' : 'DISABLED'}
                              size="small"
                              sx={{
                                bgcolor: getSettingValue(key) ? '#00bcd4' : '#9e9e9e',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ color: '#666', mb: 2, lineHeight: 1.6 }}>
                            {config.description}
                          </Typography>
                          
                          {settings[key]?.updatedAt && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: '#999', fontWeight: 500 }}>
                                Last updated:
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                                {new Date(settings[key].updatedAt).toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Switch
                            checked={getSettingValue(key)}
                            onChange={(e) => handleSettingChange(key, e.target.checked)}
                            disabled={saving}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#00bcd4',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#00bcd4',
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: '#bdbdbd',
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, setting: null, value: null })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
          color: 'white',
          fontWeight: 700
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SecurityIcon />
            Confirm Setting Change
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, color: '#333', fontWeight: 500, lineHeight: 1.6 }}>
            {confirmDialog.message}
          </Typography>
          <Alert 
            severity="warning"
            sx={{ 
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontWeight: 600
              }
            }}
          >
            This change will take effect immediately for all users.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setConfirmDialog({ open: false, setting: null, value: null })}
            disabled={saving}
            variant="outlined"
            sx={{
              borderColor: '#e0e0e0',
              color: '#666',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                borderColor: '#bdbdbd',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmChange}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SaveIcon />}
            sx={{
              bgcolor: '#00bcd4',
              color: 'white',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: '#0097a7',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 188, 212, 0.3)'
              },
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Updating...' : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;