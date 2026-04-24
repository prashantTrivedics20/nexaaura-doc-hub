import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  Description as DocumentIcon,
  People as PeopleIcon,
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalUsers: 0,
    totalDownloads: 0,
    avgFileSize: 0
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Fixed: use sessionStorage
      
      // Fetch admin statistics from the new endpoint
      const adminStatsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/admin/stats`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Fetch recent documents
      const docsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents?limit=5`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Fetch recent users
      const usersResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users?limit=5`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (adminStatsResponse.ok) {
        const adminStats = await adminStatsResponse.json();
        setStats({
          totalDocuments: adminStats.overview?.totalDocuments || 0,
          totalUsers: adminStats.overview?.totalUsers || 0,
          totalDownloads: adminStats.overview?.totalDownloads || 0,
          avgFileSize: adminStats.overview?.avgFileSize || 0
        });
      }

      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setRecentDocuments(docsData.documents || []);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setRecentUsers(usersData.users || []);
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      enqueueSnackbar('Failed to fetch dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem({ ...item, type });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = {
      policy: '#8B5CF6',
      procedure: '#EC4899',
      manual: '#10B981',
      report: '#F59E0B',
      contract: '#3B82F6',
      other: '#6B7280'
    };
    return colors[category] || colors.other;
  };

  const quickActions = [
    {
      title: 'Upload Document',
      description: 'Add new document to the system',
      icon: <UploadIcon />,
      color: '#8B5CF6',
      action: () => navigate('/admin/documents')
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <PeopleIcon />,
      color: '#EC4899',
      action: () => navigate('/admin/users')
    },
    {
      title: 'View Analytics',
      description: 'Check system analytics and reports',
      icon: <AnalyticsIcon />,
      color: '#10B981',
      action: () => navigate('/admin/analytics')
    },
    {
      title: 'Document Library',
      description: 'Browse all documents',
      icon: <FolderIcon />,
      color: '#F59E0B',
      action: () => navigate('/admin/documents')
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage documents, users, and monitor system performance
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    mr: 2
                  }}
                >
                  <DocumentIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width={60} height={40} />
                      <Skeleton variant="text" width={100} height={20} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalDocuments}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Documents
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              {loading && <LinearProgress />}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    mr: 2
                  }}
                >
                  <PeopleIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width={60} height={40} />
                      <Skeleton variant="text" width={100} height={20} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              {loading && <LinearProgress />}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    mr: 2
                  }}
                >
                  <DownloadIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width={60} height={40} />
                      <Skeleton variant="text" width={100} height={20} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalDownloads}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Downloads
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              {loading && <LinearProgress />}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    mr: 2
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width={80} height={40} />
                      <Skeleton variant="text" width={100} height={20} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formatFileSize(stats.avgFileSize)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg File Size
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
              {loading && <LinearProgress />}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={action.action}
                  sx={{
                    p: 2,
                    height: '100%',
                    flexDirection: 'column',
                    borderColor: action.color,
                    color: action.color,
                    '&:hover': {
                      backgroundColor: `${action.color}10`,
                      borderColor: action.color
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      backgroundColor: action.color,
                      mb: 1,
                      width: 48,
                      height: 48
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {action.description}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Documents
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/documents')}
                  sx={{ color: '#8B5CF6' }}
                >
                  View All
                </Button>
              </Box>

              {loading ? (
                <List>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <ListItem key={item} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Skeleton variant="circular" width={40} height={40} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" height={24} />}
                        secondary={<Skeleton variant="text" width="40%" height={20} />}
                      />
                      <Skeleton variant="circular" width={24} height={24} />
                    </ListItem>
                  ))}
                </List>
              ) : recentDocuments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No documents yet</Typography>
                </Box>
              ) : (
                <List>
                  {recentDocuments.map((doc, index) => (
                    <ListItem
                      key={doc._id}
                      sx={{
                        px: 0,
                        '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.05)' }
                      }}
                      secondaryAction={
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, doc, 'document')}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: getCategoryColor(doc.category),
                            width: 40,
                            height: 40
                          }}
                        >
                          <DocumentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" noWrap>
                              {doc.title}
                            </Typography>
                            <Chip
                              label={doc.category}
                              size="small"
                              sx={{
                                backgroundColor: getCategoryColor(doc.category),
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(doc.createdAt).toLocaleDateString()} • {doc.downloadCount || 0} downloads
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Users
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/users')}
                  sx={{ color: '#8B5CF6' }}
                >
                  View All
                </Button>
              </Box>

              {loading ? (
                <List>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <ListItem key={item} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Skeleton variant="circular" width={40} height={40} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" height={24} />}
                        secondary={<Skeleton variant="text" width="80%" height={20} />}
                      />
                      <Skeleton variant="circular" width={24} height={24} />
                    </ListItem>
                  ))}
                </List>
              ) : recentUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No users yet</Typography>
                </Box>
              ) : (
                <List>
                  {recentUsers.map((user, index) => (
                    <ListItem
                      key={user._id}
                      sx={{
                        px: 0,
                        '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.05)' }
                      }}
                      secondaryAction={
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user, 'user')}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: user.role === 'admin' 
                              ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                              : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            width: 40,
                            height: 40
                          }}
                        >
                          {user.username?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">
                              {user.username}
                            </Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.7rem',
                                borderColor: user.role === 'admin' ? '#8B5CF6' : '#10B981',
                                color: user.role === 'admin' ? '#8B5CF6' : '#10B981'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }
        }}
      >
        {selectedItem?.type === 'document' && (
          <MenuItem onClick={() => {
            navigate(`/admin/documents`);
            handleMenuClose();
          }}>
            View Document Details
          </MenuItem>
        )}
        {selectedItem?.type === 'user' && (
          <MenuItem onClick={() => {
            navigate(`/admin/users`);
            handleMenuClose();
          }}>
            View User Details
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default AdminDashboard;