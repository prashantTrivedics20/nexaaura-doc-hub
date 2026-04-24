import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Alert,
  CircularProgress,
  Fab,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Description as DocumentIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const DocumentManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();

  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDocument, setMenuDocument] = useState(null);

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  useEffect(() => {
    fetchCategories();
    fetchDocuments();
  }, [page, rowsPerPage, searchTerm, categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/categories`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedCategories = [
          { value: '', label: 'All Categories' },
          ...data.categories.map(cat => ({
            value: cat.name,
            label: cat.displayName
          }))
        ];
        setCategories(formattedCategories);
      } else {
        console.error('Failed to fetch categories');
        // Fallback to default categories
        setCategories([
          { value: '', label: 'All Categories' },
          { value: 'other', label: 'Other' }
        ]);
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      // Fallback to default categories
      setCategories([
        { value: '', label: 'All Categories' },
        { value: 'other', label: 'Other' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else {
        enqueueSnackbar('Failed to fetch documents', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        enqueueSnackbar('File size must be less than 50MB', { variant: 'error' });
        return;
      }
      setUploadedFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  const handleUpload = async (data) => {
    if (!uploadedFile) {
      enqueueSnackbar('Please select a file to upload', { variant: 'error' });
      return;
    }

    setUploading(true);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('document', uploadedFile);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('category', data.category);
      formData.append('tags', data.tags || '');
      formData.append('isPublic', data.isPublic || false);
      formData.append('accessLevel', data.accessLevel || 'internal');
      formData.append('version', data.version || '1.0');
      formData.append('status', data.status || 'published');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/upload`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );

      if (response.ok) {
        enqueueSnackbar('Document uploaded successfully', { variant: 'success' });
        setUploadDialogOpen(false);
        setUploadedFile(null);
        reset();
        fetchDocuments();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Upload failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error during upload', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/${selectedDocument._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (response.ok) {
        enqueueSnackbar('Document updated successfully', { variant: 'success' });
        setEditDialogOpen(false);
        setSelectedDocument(null);
        fetchDocuments();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Update failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error during update', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/${selectedDocument._id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        enqueueSnackbar('Document deleted successfully', { variant: 'success' });
        setDeleteDialogOpen(false);
        setSelectedDocument(null);
        fetchDocuments();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Delete failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error during deletion', { variant: 'error' });
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/documents/${documentId}/download`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        window.open(data.downloadUrl, '_blank');
        enqueueSnackbar('Download started', { variant: 'success' });
      } else {
        enqueueSnackbar('Download failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setMenuDocument(document);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDocument(null);
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

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6B7280',
      published: '#10B981',
      archived: '#F59E0B'
    };
    return colors[status] || colors.draft;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Document Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload, manage, and organize your documents
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            px: 3
          }}
        >
          Upload Document
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  disabled={categoriesLoading}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Downloads</TableCell>
                <TableCell>Uploaded</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Skeleton rows for loading state
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box>
                          <Skeleton variant="text" width={150} height={24} />
                          <Skeleton variant="text" width={100} height={20} />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={60} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={90} height={20} />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <DocumentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">No documents found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: getCategoryColor(doc.category),
                            width: 40,
                            height: 40
                          }}
                        >
                          <DocumentIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {doc.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.description || 'No description'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.category}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(doc.category),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.status}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: getStatusColor(doc.status),
                          color: getStatusColor(doc.status)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatFileSize(doc.file?.size || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {doc.downloadCount || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(doc._id, doc.file?.originalName)}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setEditDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, doc)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={documents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload New Document</DialogTitle>
        <form onSubmit={handleSubmit(handleUpload)}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* File Upload Area */}
              <Grid item xs={12}>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed #8B5CF6',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.05)'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIcon sx={{ fontSize: 48, color: '#8B5CF6', mb: 2 }} />
                  {uploadedFile ? (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {uploadedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(uploadedFile.size)}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Drop files here or click to browse
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supports PDF, DOC, DOCX, TXT, and images (Max 50MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Form Fields */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title"
                  {...register('title', { required: 'Title is required' })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  defaultValue="other"
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category" disabled={categoriesLoading}>
                        {categories.slice(1).map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  {...register('description')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  {...register('tags')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="published"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {statuses.slice(1).map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Document</DialogTitle>
        <form onSubmit={handleSubmit(handleEdit)}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title"
                  defaultValue={selectedDocument?.title}
                  {...register('title', { required: 'Title is required' })}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="category"
                  control={control}
                  defaultValue={selectedDocument?.category || 'other'}
                  rules={{ required: 'Category is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category" disabled={categoriesLoading}>
                        {categories.slice(1).map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  defaultValue={selectedDocument?.description}
                  {...register('description')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  defaultValue={selectedDocument?.tags?.join(', ')}
                  {...register('tags')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  defaultValue={selectedDocument?.status || 'published'}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {statuses.slice(1).map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Document</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The document will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete "{selectedDocument?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
        <MenuItem onClick={() => {
          handleDownload(menuDocument._id, menuDocument.file?.originalName);
          handleMenuClose();
        }}>
          <DownloadIcon sx={{ mr: 1 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => {
          setSelectedDocument(menuDocument);
          setEditDialogOpen(true);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          setSelectedDocument(menuDocument);
          setDeleteDialogOpen(true);
          handleMenuClose();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setUploadDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default DocumentManagement;