import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00bcd4', // Cyan
      light: '#62efff',
      dark: '#008ba3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#ff6b6b', // Coral Red
      light: '#ff9999',
      dark: '#cc5555',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f1f3f6', // Light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#878787',
      disabled: '#c2c2c2',
    },
    divider: '#e0e0e0',
    success: {
      main: '#388e3c',
      light: '#66bb6a',
      dark: '#2e7d32',
    },
    warning: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: '#212121',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      color: '#212121',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#212121',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#212121',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#212121',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#212121',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#212121',
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#878787',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 2,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.12)',
    '0 2px 4px rgba(0,0,0,0.12)',
    '0 3px 6px rgba(0,0,0,0.12)',
    '0 4px 8px rgba(0,0,0,0.12)',
    '0 6px 12px rgba(0,0,0,0.12)',
    '0 8px 16px rgba(0,0,0,0.12)',
    '0 12px 24px rgba(0,0,0,0.12)',
    '0 16px 32px rgba(0,0,0,0.12)',
    '0 20px 40px rgba(0,0,0,0.12)',
    '0 24px 48px rgba(0,0,0,0.12)',
    '0 28px 56px rgba(0,0,0,0.12)',
    '0 32px 64px rgba(0,0,0,0.12)',
    '0 36px 72px rgba(0,0,0,0.12)',
    '0 40px 80px rgba(0,0,0,0.12)',
    '0 44px 88px rgba(0,0,0,0.12)',
    '0 48px 96px rgba(0,0,0,0.12)',
    '0 52px 104px rgba(0,0,0,0.12)',
    '0 56px 112px rgba(0,0,0,0.12)',
    '0 60px 120px rgba(0,0,0,0.12)',
    '0 64px 128px rgba(0,0,0,0.12)',
    '0 68px 136px rgba(0,0,0,0.12)',
    '0 72px 144px rgba(0,0,0,0.12)',
    '0 76px 152px rgba(0,0,0,0.12)',
    '0 80px 160px rgba(0,0,0,0.12)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f1f3f6',
          minHeight: '100vh',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#bdc1c6 #f1f3f6',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#f1f3f6',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#bdc1c6',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: '#9aa0a6',
        },
        'input:-webkit-autofill': {
          WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
          WebkitTextFillColor: '#202124 !important',
        },
        '::selection': {
          backgroundColor: 'rgba(0, 188, 212, 0.2)',
          color: '#202124',
        },
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        '@keyframes slideUp': {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 500,
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          },
        },
        outlined: {
          padding: '7px 15px',
        },
        text: {
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#dadce0',
              borderWidth: '1px',
            },
            '&:hover': {
              '& fieldset': {
                borderColor: '#bdc1c6',
              },
            },
            '&.Mui-focused': {
              '& fieldset': {
                borderColor: '#1a73e8',
                borderWidth: '2px',
              },
            },
            '& input': {
              color: '#202124',
              fontSize: '1rem',
              fontWeight: 400,
              padding: '12px 14px',
              '&::placeholder': {
                color: '#5f6368',
                opacity: 1,
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: '#5f6368',
            fontWeight: 400,
            '&.Mui-focused': {
              color: '#1a73e8',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.8125rem',
          height: 32,
        },
        filled: {
          backgroundColor: '#e8f0fe',
          color: '#1a73e8',
        },
        outlined: {
          borderColor: '#dadce0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#2d3436',
          borderBottom: '1px solid #e8eaed',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#5f6368',
          color: '#ffffff',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 400,
          padding: '6px 8px',
        },
        arrow: {
          color: '#5f6368',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #dadce0',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#e8eaed',
          height: 4,
        },
        bar: {
          backgroundColor: '#1a73e8',
          borderRadius: 4,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: '#f1f3f4',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: '#e6f4ea',
          borderColor: '#34a853',
          color: '#137333',
        },
        standardError: {
          backgroundColor: '#fce8e6',
          borderColor: '#ea4335',
          color: '#c5221f',
        },
        standardWarning: {
          backgroundColor: '#fef7e0',
          borderColor: '#fbbc04',
          color: '#f29900',
        },
        standardInfo: {
          backgroundColor: '#e8f0fe',
          borderColor: '#1a73e8',
          color: '#1557b0',
        },
      },
    },
  },
});

export default theme;