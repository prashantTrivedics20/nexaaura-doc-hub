import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CircularProgress,
  Container,
  Stack,
  Avatar,
  Paper,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Folder as FolderIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  CloudDownload as CloudDownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import DocumentViewer from '../components/DocumentViewer';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [freeAccessEnabled, setFreeAccessEnabled] = useState(false);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalCategories: 0,
    totalDownloads: 0,
    userProgress: 0
  });
  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Documents', count: 0 }
  ]);

  useEffect(() => {
    checkAdminSettings();
    fetchStats();
    fetchDocuments();
  }, [selectedCategory, searchTerm]);

  const checkAdminSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/settings/public/free-access`);
      if (response.ok) {
        const data = await response.json();
        setFreeAccessEnabled(data.freeAccessEnabled || false);
      }
    } catch (error) {
      console.error('Error checking admin settings:', error);
      setFreeAccessEnabled(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/stats/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const hasAccess = () => {
    return freeAccessEnabled || user?.isPremium || user?.role === 'admin';
  };

  const fetchDocuments = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('limit', '100');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
        
        const categoryCounts = data.documents.reduce((acc, doc) => {
          acc[doc.category] = (acc[doc.category] || 0) + 1;
          return acc;
        }, {});

        const dynamicCategories = [
          { value: 'all', label: 'All', count: data.documents.length }
        ];

        Object.keys(categoryCounts).forEach(cat => {
          dynamicCategories.push({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            count: categoryCounts[cat]
          });
        });

        setCategories(dynamicCategories);
      } else {
        enqueueSnackbar('Failed to fetch documents', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    if (!hasAccess()) {
      enqueueSnackbar('Premium access required', { variant: 'warning' });
      navigate('/app/premium');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/${documentId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        let downloadFilename = data.filename;
        if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
          downloadFilename = downloadFilename + '.pdf';
        }
        
        try {
          const fileResponse = await fetch(data.downloadUrl);
          if (fileResponse.ok) {
            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = downloadFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(url);
            
            enqueueSnackbar(`Downloaded ${downloadFilename}`, { variant: 'success' });
          } else {
            throw new Error('Failed to fetch file');
          }
        } catch (fetchError) {
          console.error('File fetch error:', fetchError);
          window.open(data.downloadUrl, '_blank');
          enqueueSnackbar('Download opened in new tab', { variant: 'info' });
        }
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Download failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Download error:', error);
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  const handleViewDocument = (index) => {
    if (!hasAccess()) {
      enqueueSnackbar('Premium access required', { variant: 'warning' });
      navigate('/app/premium');
      return;
    }
    
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">
        {/* Premium Banner */}
        {!hasAccess() && (
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 3,
              bgcolor: alpha('#ff6b6b', 0.1),
              border: '1px solid',
              borderColor: alpha('#ff6b6b', 0.3),
              borderRadius: 2,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: '#ff6b6b', width: 48, height: 48 }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#212121' }}>
                    Upgrade to Premium
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#616161' }}>
                    Get unlimited access to all documents for just ₹30
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                onClick={() => navigate('/app/premium')}
                sx={{
                  bgcolor: '#ff6b6b',
                  '&:hover': { bgcolor: '#cc5555' },
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                }}
              >
                Upgrade Now
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#212121', mb: 1 }}>
            Welcome back, {user?.profile?.firstName || user?.username}! 👋
          </Typography>
          <Typography variant="body1" sx={{ color: '#616161' }}>
            {hasAccess() ? 'You have full access to all documents' : 'Upgrade to premium for unlimited access'}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              icon: <DocumentIcon sx={{ fontSize: 32 }} />,
              title: 'Total Documents',
              value: stats.totalDocuments || documents.length,
              color: '#00bcd4',
              bgColor: alpha('#00bcd4', 0.1),
            },
            {
              icon: <FolderIcon sx={{ fontSize: 32 }} />,
              title: 'Categories',
              value: stats.totalCategories || new Set(documents.map(doc => doc.category)).size,
              color: '#4caf50',
              bgColor: alpha('#4caf50', 0.1),
            },
            {
              icon: <CloudDownloadIcon sx={{ fontSize: 32 }} />,
              title: 'Total Downloads',
              value: stats.totalDownloads || documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0),
              color: '#ff9800',
              bgColor: alpha('#ff9800', 0.1),
            },
            {
              icon: <StarIcon sx={{ fontSize: 32 }} />,
              title: 'Your Access',
              value: user?.role === 'admin' ? 'Admin' : hasAccess() ? 'Premium' : 'Free',
              color: '#9c27b0',
              bgColor: alpha('#9c27b0', 0.1),
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={0} sx={{ height: '100%', border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: stat.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#212121' }}>
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#616161' }}>
                        {stat.title}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and Filter */}
        <Paper elevation={0} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#616161' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                {categories.map((category) => (
                  <Chip
                    key={category.value}
                    label={`${category.label} (${category.count})`}
                    onClick={() => setSelectedCategory(category.value)}
                    sx={{
                      bgcolor: selectedCategory === category.value ? '#00bcd4' : '#ffffff',
                      color: selectedCategory === category.value ? '#ffffff' : '#212121',
                      border: '1px solid',
                      borderColor: selectedCategory === category.value ? '#00bcd4' : '#e0e0e0',
                      fontWeight: selectedCategory === category.value ? 600 : 500,
                      '&:hover': {
                        bgcolor: selectedCategory === category.value ? '#008ba3' : alpha('#00bcd4', 0.1),
                      },
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Documents Grid */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#212121' }}>
              Documents ({documents.length})
            </Typography>
          </Box>

          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                  <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                    <Box sx={{ height: 160, bgcolor: '#f5f7fa' }} />
                    <CardContent>
                      <Box sx={{ height: 100 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : documents.length === 0 ? (
            <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <DocumentIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#616161', mb: 1 }}>
                No documents found
              </Typography>
              <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Documents will appear here once uploaded'
                }
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {documents.map((doc, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderColor: '#00bcd4',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f5f7fa',
                        borderBottom: '1px solid #e0e0e0',
                        position: 'relative',
                      }}
                    >
                      <DocumentIcon sx={{ fontSize: 64, color: '#bdbdbd' }} />
                      
                      {!hasAccess() && (
                        <Chip
                          icon={<StarIcon />}
                          label="Premium"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: '#ff6b6b',
                            color: '#ffffff',
                            fontWeight: 600,
                          }}
                        />
                      )}

                      <Chip
                        label={doc.category}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: '#00bcd4',
                          color: '#ffffff',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: '#212121',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 48,
                        }}
                      >
                        {doc.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          color: '#616161',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 40,
                        }}
                      >
                        {doc.description || 'No description'}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          label={formatFileSize(doc.file?.size || 0)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${doc.downloadCount || 0} downloads`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>

                      {hasAccess() ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDocument(index)}
                            sx={{
                              bgcolor: '#00bcd4',
                              textTransform: 'none',
                              '&:hover': { bgcolor: '#008ba3' },
                            }}
                          >
                            View
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(doc._id, doc.file?.originalName)}
                            sx={{ border: '1px solid #e0e0e0' }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() => navigate('/app/premium')}
                          sx={{
                            bgcolor: '#ff6b6b',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#cc5555' },
                          }}
                        >
                          Upgrade to View
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Document Viewer */}
      <DocumentViewer
        documents={documents}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        initialIndex={viewerIndex}
      />
    </Box>
  );
};

export default Dashboard;
