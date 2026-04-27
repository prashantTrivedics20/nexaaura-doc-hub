import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Container,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Star as PremiumIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle,
  Logout,
  Settings,
  Description as DocumentIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const mainMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/app/dashboard',
      roles: ['user', 'admin']
    },
    {
      text: 'Premium',
      icon: <PremiumIcon />,
      path: '/app/premium',
      roles: ['user', 'admin']
    }
  ];

  const adminMenuItems = [
    {
      text: 'Admin',
      icon: <AdminIcon />,
      path: '/app/admin',
      roles: ['admin']
    },
    {
      text: 'Documents',
      icon: <DocumentIcon />,
      path: '/app/admin/documents',
      roles: ['admin']
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/app/admin/users',
      roles: ['admin']
    },
    {
      text: 'Categories',
      icon: <CategoryIcon />,
      path: '/app/admin/categories',
      roles: ['admin']
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/app/admin/analytics',
      roles: ['admin']
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/app/admin/settings',
      roles: ['admin']
    }
  ];

  const allMenuItems = [...mainMenuItems, ...(user?.role === 'admin' ? adminMenuItems : [])];

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Top Navigation Bar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0, sm: 2 } }}>
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                mr: 4
              }}
              onClick={() => navigate('/app/dashboard')}
            >
              <Avatar
                sx={{
                  bgcolor: '#00bcd4',
                  width: 40,
                  height: 40,
                  mr: 1.5,
                }}
              >
                <DocumentIcon />
              </Avatar>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#212121',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Document Hub
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
                {allMenuItems
                  .filter(item => item.roles.includes(user?.role))
                  .map((item) => (
                    <Button
                      key={item.text}
                      onClick={() => navigate(item.path)}
                      startIcon={item.icon}
                      sx={{
                        color: isActive(item.path) ? '#00bcd4' : '#616161',
                        bgcolor: isActive(item.path) ? '#e0f7fa' : 'transparent',
                        fontWeight: isActive(item.path) ? 600 : 500,
                        textTransform: 'none',
                        px: 2,
                        '&:hover': {
                          bgcolor: '#e0f7fa',
                          color: '#00bcd4',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
              </Stack>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <Box sx={{ flexGrow: 1 }}>
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ color: '#616161' }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}

            {/* User Profile */}
            <Stack direction="row" spacing={2} alignItems="center">
              {user?.role === 'admin' && (
                <Chip
                  label="Admin"
                  size="small"
                  sx={{
                    bgcolor: '#00bcd4',
                    color: '#ffffff',
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'flex' }
                  }}
                />
              )}
              
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ p: 0 }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#00bcd4',
                    width: 36,
                    height: 36,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 280, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#212121' }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List>
            {allMenuItems
              .filter(item => item.roles.includes(user?.role))
              .map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    sx={{
                      bgcolor: isActive(item.path) ? '#e0f7fa' : 'transparent',
                      '&:hover': {
                        bgcolor: '#e0f7fa',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive(item.path) ? '#00bcd4' : '#616161' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          color: isActive(item.path) ? '#00bcd4' : '#212121',
                          fontWeight: isActive(item.path) ? 600 : 500,
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.username}
          </Typography>
          <Typography variant="caption" sx={{ color: '#616161' }}>
            {user?.email}
          </Typography>
        </Box>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
