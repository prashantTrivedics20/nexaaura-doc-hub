import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  AccountCircle,
  Logout,
  Settings,
  Star as PremiumIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  const menuItems = [
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
      roles: ['user', 'admin'],
      chip: 'Pro'
    }
  ];

  const adminMenuItems = [
    {
      text: 'Admin Dashboard',
      icon: <AdminIcon />,
      path: '/app/admin',
      roles: ['admin']
    },
    {
      text: 'Document Management',
      icon: <DocumentIcon />,
      path: '/app/admin/documents',
      roles: ['admin']
    },
    {
      text: 'Category Management',
      icon: <CategoryIcon />,
      path: '/app/admin/categories',
      roles: ['admin']
    },
    {
      text: 'User Management',
      icon: <PeopleIcon />,
      path: '/app/admin/users',
      roles: ['admin']
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/app/admin/analytics',
      roles: ['admin']
    }
  ];

  const isActive = (path) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1
          }}
        >
          NEXAURA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Developer Hub
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(139, 92, 246, 0.2)' }} />

      {/* Main Navigation */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  backgroundColor: isActive(item.path) 
                    ? 'rgba(139, 92, 246, 0.15)' 
                    : 'transparent',
                  border: isActive(item.path) 
                    ? '1px solid rgba(139, 92, 246, 0.3)' 
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive(item.path) ? '#8B5CF6' : 'text.secondary',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive(item.path) ? '#8B5CF6' : 'text.primary',
                      fontWeight: isActive(item.path) ? 600 : 400
                    }
                  }}
                />
                {item.chip && (
                  <Chip
                    label={item.chip}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      {/* Admin Section */}
      {user?.role === 'admin' && (
        <>
          <Divider sx={{ mx: 2, borderColor: 'rgba(139, 92, 246, 0.2)' }} />
          <Typography
            variant="caption"
            sx={{
              px: 3,
              py: 1,
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Administration
          </Typography>
          <List sx={{ px: 2 }}>
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    backgroundColor: isActive(item.path) 
                      ? 'rgba(139, 92, 246, 0.15)' 
                      : 'transparent',
                    border: isActive(item.path) 
                      ? '1px solid rgba(139, 92, 246, 0.3)' 
                      : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive(item.path) ? '#8B5CF6' : 'text.secondary',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: isActive(item.path) ? '#8B5CF6' : 'text.primary',
                        fontWeight: isActive(item.path) ? 600 : 400
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* User Profile Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              mr: 2
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: 'none',
          borderBottom: 'none'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/app/dashboard' && 'Dashboard'}
            {location.pathname === '/app/premium' && 'Premium Features'}
            {location.pathname === '/app/admin' && 'Admin Dashboard'}
            {location.pathname === '/app/admin/documents' && 'Document Management'}
            {location.pathname === '/app/admin/categories' && 'Category Management'}
            {location.pathname === '/app/admin/users' && 'User Management'}
            {location.pathname === '/app/admin/analytics' && 'Analytics'}
          </Typography>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            mt: 1
          }
        }}
      >
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

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 },
          '& .MuiDrawer-root': {
            border: 'none !important'
          },
          '& .MuiPaper-root': {
            border: 'none !important',
            borderRight: 'none !important'
          }
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
              borderRight: '0px !important',
              border: '0px !important',
              outline: 'none !important'
            },
          }}
          PaperProps={{
            style: {
              border: 'none',
              borderRight: 'none',
              outline: 'none'
            }
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
              borderRight: '0px !important',
              border: '0px !important',
              outline: 'none !important'
            },
          }}
          open
          PaperProps={{
            style: {
              border: 'none',
              borderRight: 'none',
              outline: 'none'
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)'
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;