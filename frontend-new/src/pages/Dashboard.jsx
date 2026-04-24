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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Skeleton,
  Paper,
  Stack,
  Badge,
  Tooltip,
  LinearProgress,
  Fade,
  Grow
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  BookmarkBorder as BookmarkIcon,
  Schedule as RecentIcon,
  Whatshot as HotIcon,
  School as LearnIcon,
  Code as CodeIcon,
  Psychology as BrainIcon,
  Rocket as RocketIcon
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [categories, setCategories] = useState([
    { value: 'all', label: 'All Documents', count: 0 }
  ]);

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, searchTerm]);

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
      params.append('limit', '100'); // Get all documents

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
        
        // Calculate category counts from actual documents
        const categoryCounts = data.documents.reduce((acc, doc) => {
          acc[doc.category] = (acc[doc.category] || 0) + 1;
          return acc;
        }, {});

        // Build dynamic categories
        const dynamicCategories = [
          { value: 'all', label: 'All Documents', count: data.documents.length }
        ];

        const categoryLabels = {
          policy: 'Policies',
          procedure: 'Procedures',
          manual: 'Manuals',
          report: 'Reports',
          contract: 'Contracts',
          other: 'Other'
        };

        Object.keys(categoryCounts).forEach(cat => {
          dynamicCategories.push({
            value: cat,
            label: categoryLabels[cat] || cat,
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

  const handleMenuOpen = (event, doc) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handleDownload = async (documentId, filename) => {
    // Check if user is premium before allowing download
    if (!user?.isPremium && user?.role !== 'admin') {
      enqueueSnackbar('Premium access required to download documents', { variant: 'warning' });
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
        
        // Ensure filename has .pdf extension
        let downloadFilename = data.filename;
        if (!downloadFilename.toLowerCase().endsWith('.pdf')) {
          downloadFilename = downloadFilename + '.pdf';
        }
        
        try {
          // Fetch the actual file content
          const fileResponse = await fetch(data.downloadUrl);
          if (fileResponse.ok) {
            // Create blob and download
            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = downloadFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the blob URL
            window.URL.revokeObjectURL(url);
            
            enqueueSnackbar(`Downloaded ${downloadFilename}`, { variant: 'success' });
          } else {
            throw new Error('Failed to fetch file');
          }
        } catch (fetchError) {
          console.error('File fetch error:', fetchError);
          // Fallback: open in new tab
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
    // Check if user is premium before allowing view
    if (!user?.isPremium && user?.role !== 'admin') {
      enqueueSnackbar('Premium access required to view documents', { variant: 'warning' });
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

  return (
    <Box>
      {/* Premium Upgrade Banner for Non-Premium Users */}
      {!user?.isPremium && user?.role !== 'admin' && (
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            border: 'none'
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StarIcon sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Upgrade to Premium Access
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Get full access to view and download all documents for just ₹30 (one-time payment)
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/app/premium')}
                sx={{
                  backgroundColor: 'white',
                  color: '#8B5CF6',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                Upgrade Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <Fade in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              borderRadius: '50%',
              opacity: 0.1
            }}
          />
          
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    width: 60,
                    height: 60,
                    mr: 3,
                    fontSize: '1.5rem'
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || '👨‍💻'}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Welcome back, {user?.profile?.firstName || user?.username}! 🚀
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Ready to continue your learning journey? Explore our curated developer resources.
                  </Typography>
                </Box>
              </Box>
              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Chip
                  icon={<LearnIcon />}
                  label="Learning Mode"
                  variant="outlined"
                  sx={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}
                />
                <Chip
                  icon={user?.isPremium || user?.role === 'admin' ? <StarIcon /> : <RocketIcon />}
                  label={user?.isPremium || user?.role === 'admin' ? 'Premium Access' : 'Free Access'}
                  sx={{
                    background: user?.isPremium || user?.role === 'admin' 
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  🎯 Learning Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                      borderRadius: 4
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  75% Complete • Keep going! 💪
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Quick Stats */}
      <Grow in timeout={1000}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center' }}>
            📊 Learning Dashboard
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      <DocumentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                        {documents.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📚 Available Resources
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      <FolderIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981' }}>
                        {new Set(documents.map(doc => doc.category)).size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        🗂️ Learning Paths
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                        {documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📈 Total Engagements
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  background: user?.isPremium || user?.role === 'admin'
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  border: user?.isPremium || user?.role === 'admin'
                    ? '1px solid rgba(255, 215, 0, 0.3)'
                    : '1px solid rgba(59, 130, 246, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: user?.isPremium || user?.role === 'admin'
                      ? '0 8px 32px rgba(255, 215, 0, 0.2)'
                      : '0 8px 32px rgba(59, 130, 246, 0.2)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        background: user?.isPremium || user?.role === 'admin'
                          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                          : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        mr: 2,
                        width: 48,
                        height: 48
                      }}
                    >
                      {user?.isPremium || user?.role === 'admin' ? <StarIcon /> : <BrainIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        color: user?.isPremium || user?.role === 'admin' ? '#FFD700' : '#3B82F6',
                        fontSize: '1.1rem'
                      }}>
                        {user?.role === 'admin' ? '👑 Admin' : user?.isPremium ? '⭐ Premium' : '🚀 Free'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.isPremium || user?.role === 'admin' ? '🔓 Full Access' : '🔒 Limited Access'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Grow>

      {/* Search and Filter */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, rgba(22, 33, 62, 0.6) 0%, rgba(26, 26, 46, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: 3
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          🔍 Discover Content
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search for tutorials, guides, documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#8B5CF6' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(139, 92, 246, 0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <FilterIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Filter by Learning Path:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map((category) => (
                  <Chip
                    key={category.value}
                    label={`${category.label} (${category.count})`}
                    onClick={() => setSelectedCategory(category.value)}
                    variant={selectedCategory === category.value ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: selectedCategory === category.value 
                        ? getCategoryColor(category.value) 
                        : 'transparent',
                      borderColor: getCategoryColor(category.value),
                      color: selectedCategory === category.value ? 'white' : getCategoryColor(category.value),
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: selectedCategory === category.value 
                          ? getCategoryColor(category.value) 
                          : `${getCategoryColor(category.value)}20`,
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Documents Grid - Enhanced Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center' }}>
              📚 Learning Resources
              <Chip
                label={`${documents.length} items`}
                size="small"
                sx={{
                  ml: 2,
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8B5CF6',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
              />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || selectedCategory !== 'all' 
                ? `Filtered results for your search`
                : 'Curated content to accelerate your development journey'
              }
            </Typography>
          </Box>
          
          {!user?.isPremium && user?.role !== 'admin' && (
            <Tooltip title="Upgrade to Premium for full access">
              <Button
                variant="outlined"
                size="small"
                startIcon={<StarIcon />}
                onClick={() => navigate('/app/premium')}
                sx={{
                  borderColor: '#FFD700',
                  color: '#FFD700',
                  '&:hover': {
                    borderColor: '#FFA500',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)'
                  }
                }}
              >
                Upgrade
              </Button>
            </Tooltip>
          )}
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Document Icon/Preview Skeleton */}
                  <Skeleton
                    variant="rectangular"
                    height={180}
                    sx={{ borderBottom: '3px solid rgba(139, 92, 246, 0.2)' }}
                  />

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Document Title Skeleton */}
                    <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="70%" height={28} />

                    {/* Document Description Skeleton */}
                    <Box sx={{ mb: 2, mt: 1 }}>
                      <Skeleton variant="text" width="100%" height={20} />
                      <Skeleton variant="text" width="80%" height={20} />
                    </Box>

                    {/* Document Meta Skeleton */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="text" width={60} height={16} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>

                    {/* Action Buttons Skeleton */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="rectangular" width="100%" height={36} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={40} height={36} sx={{ borderRadius: 1 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : documents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No documents found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Documents will appear here once they are uploaded'
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {documents.map((doc, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
                      borderColor: getCategoryColor(doc.category)
                    },
                    opacity: (!user?.isPremium && user?.role !== 'admin') ? 0.8 : 1
                  }}
                >
                  {/* Document Icon/Preview */}
                  <Box
                    sx={{
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${getCategoryColor(doc.category)}15 0%, ${getCategoryColor(doc.category)}05 100%)`,
                      borderBottom: `3px solid ${getCategoryColor(doc.category)}`,
                      position: 'relative'
                    }}
                  >
                    <DocumentIcon sx={{ fontSize: 80, color: getCategoryColor(doc.category), opacity: 0.6 }} />
                    
                    {/* Premium Lock Overlay */}
                    {!user?.isPremium && user?.role !== 'admin' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          p: 0.5
                        }}
                      >
                        <StarIcon sx={{ fontSize: 20, color: '#FFD700' }} />
                      </Box>
                    )}

                    {/* Category Badge */}
                    <Chip
                      label={doc.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: getCategoryColor(doc.category),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Document Title */}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 48
                      }}
                    >
                      {doc.title}
                    </Typography>

                    {/* Document Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: 40
                      }}
                    >
                      {doc.description || 'No description available'}
                    </Typography>

                    {/* Document Meta */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(doc.file?.size || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        • {doc.downloadCount || 0} downloads
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    {user?.isPremium || user?.role === 'admin' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDocument(index)}
                          sx={{
                            background: `linear-gradient(135deg, ${getCategoryColor(doc.category)} 0%, ${getCategoryColor(doc.category)}CC 100%)`,
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          View
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc._id, doc.file?.originalName)}
                          sx={{
                            border: `1px solid ${getCategoryColor(doc.category)}`,
                            color: getCategoryColor(doc.category)
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => navigate('/app/premium')}
                        sx={{
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                          textTransform: 'none',
                          fontWeight: 600
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

      {/* Document Actions Menu */}
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
        {user?.isPremium || user?.role === 'admin' ? (
          <Box>
            <MenuItem onClick={() => {
              if (selectedDoc) {
                const index = documents.findIndex(d => d._id === selectedDoc._id);
                handleViewDocument(index);
              }
              handleMenuClose();
            }}>
              <VisibilityIcon sx={{ mr: 1 }} />
              View
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedDoc) {
                handleDownload(selectedDoc._id, selectedDoc.file?.originalName);
              }
              handleMenuClose();
            }}>
              <DownloadIcon sx={{ mr: 1 }} />
              Download
            </MenuItem>
          </Box>
        ) : (
          <MenuItem onClick={() => {
            navigate('/app/premium');
            handleMenuClose();
          }}>
            <StarIcon sx={{ mr: 1 }} />
            Upgrade to Premium
          </MenuItem>
        )}
      </Menu>

      {/* Document Viewer with Carousel */}
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