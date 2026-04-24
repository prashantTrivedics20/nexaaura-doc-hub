import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6', // Purple
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EC4899', // Pink
      light: '#F472B6',
      dark: '#DB2777',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0F0F23', // Very dark blue
      paper: '#1A1A2E', // Dark blue-gray
    },
    surface: {
      main: '#16213E', // Card background
      light: '#1E2A4A',
      dark: '#0E1729',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B4B4B8',
      disabled: '#6B7280',
    },
    divider: '#2D3748',
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    // Custom colors for DocHub
    gradient: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      secondary: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      card: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#FFFFFF',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#B4B4B8',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#B4B4B8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
          minHeight: '100vh',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#1A1A2E',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#8B5CF6',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: '#A78BFA',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
        },
        contained: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
          border: 'none',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: '#8B5CF6',
          color: '#8B5CF6',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#A78BFA',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
          borderRadius: 16,
          border: '1px solid #2D3748',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#1A1A2E',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: '#2D3748',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#8B5CF6',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8B5CF6',
              boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
            },
            '& input': {
              color: '#FFFFFF',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#B4B4B8',
            '&.Mui-focused': {
              color: '#8B5CF6',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          fontSize: '0.8rem',
        },
        filled: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
          },
        },
        outlined: {
          borderColor: '#8B5CF6',
          color: '#8B5CF6',
          '&:hover': {
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #2D3748',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
          borderRadius: 16,
          border: '1px solid #2D3748',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A1A2E',
          color: '#FFFFFF',
          border: '1px solid #2D3748',
          borderRadius: 8,
          fontSize: '0.8rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none !important',
          borderRight: 'none !important',
        },
        paperAnchorDockedLeft: {
          borderRight: 'none !important',
        },
      },
    },
  },
});

export default theme;