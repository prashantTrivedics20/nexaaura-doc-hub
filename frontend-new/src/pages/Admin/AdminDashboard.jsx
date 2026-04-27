import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  IconButton,
  CircularProgress,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Description as DocumentIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      const adminStatsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/admin/stats`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const docsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents?limit=5`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const quickActions = [
    {
      title: 'Upload Document',
      action: () => navigate('/app/admin/documents')
    },
    {
      title: 'Manage Users',
      action: () => navigate('/app/admin/users')
    },
    {
      title: 'View Analytics',
      action: () => navigate('/app/admin/analytics')
    },
    {
      title: 'Settings',
      action: () => navigate('/app/admin/settings')
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f1f3f6', minHeight: '100vh', pb: 4 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ mb: 3, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 1, color: '#212121' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#878787' }}>
          Manage your document hub
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            icon: <DocumentIcon sx={{ color: '#2874f0' }} />,
            title: 'Total Documents',
            value: stats.totalDocuments,
          },
          {
            icon: <PeopleIcon sx={{ color: '#2874f0' }} />,
            title: 'Total Users',
            value: stats.totalUsers,
          },
          {
            icon: <DownloadIcon sx={{ color: '#2874f0' }} />,
            title: 'Total Downloads',
            value: stats.totalDownloads,
          },
          {
            icon: <TrendingUpIcon sx={{ color: '#2874f0' }} />,
            title: 'Avg File Size',
            value: formatFileSize(stats.avgFileSize),
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={0}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {stat.icon}
                  <Typography variant="h5" sx={{ ml: 'auto', fontWeight: 500, color: '#212121' }}>
                    {loading ? <CircularProgress size={24} /> : (typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#878787' }}>
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card elevation={0} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: '#212121' }}>
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
                    py: 2,
                    borderColor: '#dadce0',
                    color: '#212121',
                    '&:hover': {
                      borderColor: '#2874f0',
                      bgcolor: 'rgba(40, 116, 240, 0.04)',
                    },
                  }}
                >
                  {action.title}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Grid container spacing={2}>
        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#212121' }}>
                  Recent Documents
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/app/admin/documents')}
                  sx={{ color: '#2874f0' }}
                >
                  View All
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : recentDocuments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DocumentIcon sx={{ fontSize: 48, color: '#dadce0', mb: 2 }} />
                  <Typography color="text.secondary">No documents yet</Typography>
                </Box>
              ) : (
                <List>
                  {recentDocuments.map((doc) => (
                    <ListItem
                      key={doc._id}
                      sx={{ px: 0 }}
                      secondaryAction={
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#2874f0' }}>
                          <DocumentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={doc.title}
                        secondary={`${new Date(doc.createdAt).toLocaleDateString()} • ${doc.downloadCount || 0} downloads`}
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
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: '#212121' }}>
                  Recent Users
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/app/admin/users')}
                  sx={{ color: '#2874f0' }}
                >
                  View All
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : recentUsers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: '#dadce0', mb: 2 }} />
                  <Typography color="text.secondary">No users yet</Typography>
                </Box>
              ) : (
                <List>
                  {recentUsers.map((user) => (
                    <ListItem
                      key={user._id}
                      sx={{ px: 0 }}
                      secondaryAction={
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'admin' ? 'primary' : 'default'}
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: user.role === 'admin' ? '#2874f0' : '#878787' }}>
                          {user.username?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.username}
                        secondary={`${user.email} • Joined ${new Date(user.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
