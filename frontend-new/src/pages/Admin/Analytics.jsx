import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  Folder as FolderIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Analytics = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalDownloads: 0,
    avgFileSize: 0,
    totalUsers: 0
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [topDocuments, setTopDocuments] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Fixed: use sessionStorage
      
      // Fetch admin statistics from the new endpoint
      const adminStatsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/admin/stats`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Fetch analytics data
      const analyticsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/admin/analytics`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (adminStatsResponse.ok) {
        const adminStats = await adminStatsResponse.json();
        setStats({
          totalDocuments: adminStats.overview?.totalDocuments || 0,
          totalDownloads: adminStats.overview?.totalDownloads || 0,
          avgFileSize: adminStats.overview?.avgFileSize || 0,
          totalUsers: adminStats.overview?.totalUsers || 0
        });
        setCategoryStats(adminStats.categoryBreakdown || []);
        setRecentDocuments(adminStats.recentDocuments || []);
        setTopDocuments(adminStats.topDocuments || []);
      }

    } catch (error) {
      console.error('Analytics fetch error:', error);
      enqueueSnackbar('Failed to fetch analytics', { variant: 'error' });
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

  const getCategoryLabel = (category) => {
    const labels = {
      policy: 'Policies',
      procedure: 'Procedures',
      manual: 'Manuals',
      report: 'Reports',
      contract: 'Contracts',
      other: 'Other'
    };
    return labels[category] || category;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Analytics & Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor system performance and usage statistics
        </Typography>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <DocumentIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width={60} height={40} />
                      <Skeleton variant="text" width={120} height={20} />
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
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <DownloadIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width={60} height={40} />
                      <Skeleton variant="text" width={120} height={20} />
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
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    mr: 2,
                    width: 56,
                    height: 56
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
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    mr: 2,
                    width: 56,
                    height: 56
                  }}
                >
                  <StorageIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width={80} height={40} />
                      <Skeleton variant="text" width={100} height={20} />
                    </>
                  ) : (
                    <>
                      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
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

      {/* Charts and Details */}
      <Grid container spacing={3}>
        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FolderIcon sx={{ mr: 1, color: '#8B5CF6' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Documents by Category
                </Typography>
              </Box>

              {loading ? (
                <Box>
                  {[1, 2, 3, 4].map((item) => (
                    <Box key={item} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                        <Skeleton variant="text" width={100} height={24} />
                      </Box>
                      <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 4, mb: 1 }} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>
                  ))}
                </Box>
              ) : categoryStats.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              ) : (
                <Box>
                  {categoryStats.map((cat, index) => (
                    <Box key={cat._id} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={getCategoryLabel(cat._id)}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(cat._id),
                              color: 'white'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {cat.count} documents
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(cat.count / stats.totalDocuments) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getCategoryColor(cat._id),
                            borderRadius: 4
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {((cat.count / stats.totalDocuments) * 100).toFixed(1)}% of total
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Downloaded Documents */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUpIcon sx={{ mr: 1, color: '#8B5CF6' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Downloaded Documents
                </Typography>
              </Box>

              {loading ? (
                <List>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Box key={item}>
                      <ListItem sx={{ px: 0 }}>
                        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                        <ListItemText
                          primary={<Skeleton variant="text" width="70%" height={24} />}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
                              <Skeleton variant="text" width={80} height={16} />
                            </Box>
                          }
                        />
                        {item === 1 && <Skeleton variant="circular" width={24} height={24} />}
                      </ListItem>
                      {item < 5 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : topDocuments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No downloads yet</Typography>
                </Box>
              ) : (
                <List>
                  {topDocuments.map((doc, index) => (
                    <Box key={doc._id}>
                      <ListItem sx={{ px: 0 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: index === 0 
                              ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                              : index === 1
                              ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                              : index === 2
                              ? 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)'
                              : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            fontWeight: 700,
                            color: 'white'
                          }}
                        >
                          {index + 1}
                        </Box>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {doc.title}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={doc.category}
                                size="small"
                                sx={{
                                  backgroundColor: getCategoryColor(doc.category),
                                  color: 'white',
                                  fontSize: '0.7rem'
                                }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {doc.downloadCount || 0} downloads
                              </Typography>
                            </Box>
                          }
                        />
                        {index === 0 && (
                          <StarIcon sx={{ color: '#F59E0B', ml: 1 }} />
                        )}
                      </ListItem>
                      {index < topDocuments.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Uploads */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ mr: 1, color: '#8B5CF6' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Uploads
                </Typography>
              </Box>

              {loading ? (
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
                          border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Skeleton variant="text" width="80%" height={24} />
                            <Skeleton variant="text" width="60%" height={16} />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : recentDocuments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No recent uploads</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {recentDocuments.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} key={doc._id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #16213E 0%, #1A1A2E 100%)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
                            borderColor: 'rgba(139, 92, 246, 0.4)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              backgroundColor: getCategoryColor(doc.category),
                              width: 40,
                              height: 40,
                              mr: 2
                            }}
                          >
                            <DocumentIcon />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                              {doc.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            label={doc.category}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(doc.category),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                          <Chip
                            label={`${doc.downloadCount || 0} downloads`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;