import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  Avatar,
  Alert,
  CircularProgress,
  Fab,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Folder as FolderIcon,
  Palette as PaletteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';

const CategoryManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, control, reset, formState: { errors }, setValue, watch } = useForm();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCategory, setMenuCategory] = useState(null);

  // Predefined colors for categories
  const predefinedColors = [
    '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
    '#6366F1', '#8B5CF6', '#059669', '#DC2626', '#7C3AED',
    '#DB2777', '#059669', '#D97706', '#2563EB', '#7C2D12'
  ];

  // Get available colors for edit dialog (include current category color if not in predefined list)
  const getAvailableColors = (currentColor) => {
    const colors = [...predefinedColors];
    if (currentColor && !colors.includes(currentColor)) {
      colors.unshift(currentColor); // Add current color at the beginning
    }
    return [...new Set(colors)]; // Remove duplicates
  };

  // Icon options
  const iconOptions = [
    { value: 'folder', label: 'Folder' },
    { value: 'description', label: 'Document' },
    { value: 'policy', label: 'Policy' },
    { value: 'list_alt', label: 'List' },
    { value: 'menu_book', label: 'Book' },
    { value: 'assessment', label: 'Report' },
    { value: 'school', label: 'Education' },
    { value: 'content_copy', label: 'Template' },
    { value: 'engineering', label: 'Technical' },
    { value: 'business', label: 'Business' }
  ];

  // Get available icons for edit dialog (include current category icon if not in predefined list)
  const getAvailableIcons = (currentIcon) => {
    const icons = [...iconOptions];
    if (currentIcon && !icons.some(icon => icon.value === currentIcon)) {
      icons.unshift({ value: currentIcon, label: currentIcon }); // Add current icon at the beginning
    }
    return icons;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Edit form state (controlled components)
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    description: '',
    color: '#8B5CF6',
    icon: 'folder',
    isActive: true
  });

  // Set form values when edit dialog opens
  useEffect(() => {
    if (editDialogOpen && selectedCategory) {
      setEditFormData({
        displayName: selectedCategory.displayName || '',
        description: selectedCategory.description || '',
        color: selectedCategory.color || '#8B5CF6',
        icon: selectedCategory.icon || 'folder',
        isActive: selectedCategory.isActive ?? true
      });
    }
  }, [editDialogOpen, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/categories?includeInactive=true&withCounts=true`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      } else {
        enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
      }
    } catch (error) {
      console.error('Categories fetch error:', error);
      enqueueSnackbar('Network error', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setCreating(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/categories`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (response.ok) {
        enqueueSnackbar('Category created successfully', { variant: 'success' });
        setCreateDialogOpen(false);
        reset();
        fetchCategories();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Creation failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Category creation error:', error);
      enqueueSnackbar('Network error during creation', { variant: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.displayName.trim()) {
      enqueueSnackbar('Display name is required', { variant: 'error' });
      return;
    }

    setUpdating(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        enqueueSnackbar('Authentication token not found. Please login again.', { variant: 'error' });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/categories/${selectedCategory._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        }
      );

      if (response.ok) {
        enqueueSnackbar('Category updated successfully', { variant: 'success' });
        setEditDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Update failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Category update error:', error);
      enqueueSnackbar('Network error during update', { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/categories/${selectedCategory._id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        enqueueSnackbar('Category deleted successfully', { variant: 'success' });
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Delete failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Category deletion error:', error);
      enqueueSnackbar('Network error during deletion', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/categories/${category._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: !category.isActive })
        }
      );

      if (response.ok) {
        enqueueSnackbar(
          `Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`,
          { variant: 'success' }
        );
        fetchCategories();
      } else {
        const error = await response.json();
        enqueueSnackbar(error.message || 'Status update failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Category status toggle error:', error);
      enqueueSnackbar('Network error', { variant: 'error' });
    }
  };

  const handleMenuOpen = (event, category) => {
    setAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCategory(null);
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#10B981' : '#EF4444';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Category Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage document categories for better organization
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            px: 3
          }}
        >
          Create Category
        </Button>
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
                  <CategoryIcon />
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
                        {categories.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Categories
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
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
                  <VisibilityIcon />
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
                        {categories.filter(c => c.isActive).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Categories
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
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
                  <FolderIcon />
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
                        {categories.reduce((sum, c) => sum + (c.actualDocumentCount || 0), 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Documents
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    mr: 2
                  }}
                >
                  <VisibilityOffIcon />
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
                        {categories.filter(c => !c.isActive).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Inactive Categories
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Documents</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={120} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={200} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={60} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={80} height={20} />
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
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">No categories found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: category.color,
                            width: 40,
                            height: 40
                          }}
                        >
                          <FolderIcon />
                        </Avatar>
                        <Chip
                          label={category.displayName}
                          sx={{
                            backgroundColor: category.color,
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {category.actualDocumentCount || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: getStatusColor(category.isActive),
                          color: getStatusColor(category.isActive)
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={category.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(category)}
                          color={category.isActive ? 'error' : 'success'}
                        >
                          {category.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Category">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedCategory(category);
                            setEditDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, category)}
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
      </Card>

      {/* Create Category Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Category</DialogTitle>
        <form onSubmit={handleSubmit(handleCreate)}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category Name"
                  placeholder="e.g., technical-docs"
                  helperText="Lowercase, no spaces (used in URLs)"
                  {...register('name', { 
                    required: 'Category name is required',
                    pattern: {
                      value: /^[a-z0-9-_]+$/,
                      message: 'Only lowercase letters, numbers, hyphens, and underscores allowed'
                    }
                  })}
                  error={!!errors.name}
                />
                {errors.name && (
                  <Typography variant="caption" color="error">
                    {errors.name.message}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  placeholder="e.g., Technical Documentation"
                  helperText="User-friendly name shown in UI"
                  {...register('displayName', { 
                    required: 'Display name is required'
                  })}
                  error={!!errors.displayName}
                />
                {errors.displayName && (
                  <Typography variant="caption" color="error">
                    {errors.displayName.message}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Brief description of this category"
                  multiline
                  rows={2}
                  {...register('description')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="color"
                  control={control}
                  defaultValue="#8B5CF6"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Color</InputLabel>
                      <Select {...field} label="Color">
                        {predefinedColors.map((color) => (
                          <MenuItem key={color} value={color}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  backgroundColor: color,
                                  borderRadius: 1
                                }}
                              />
                              {color}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="icon"
                  control={control}
                  defaultValue="folder"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Icon</InputLabel>
                      <Select {...field} label="Icon">
                        {iconOptions.map((icon) => (
                          <MenuItem key={icon.value} value={icon.value}>
                            {icon.label}
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
            <Button onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating}
              startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {creating ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedCategory(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Category</DialogTitle>
        <form 
          key={selectedCategory?._id} // Force re-render when category changes
          onSubmit={handleEdit}
        >
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={editFormData.displayName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                  }
                  label="Active Category"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select 
                    value={editFormData.color}
                    label="Color"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, color: e.target.value }))}
                  >
                    {getAvailableColors(selectedCategory?.color).map((color) => (
                      <MenuItem key={color} value={color}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              backgroundColor: color,
                              borderRadius: 1
                            }}
                          />
                          {color}
                          {color === selectedCategory?.color && (
                            <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                              (current)
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Icon</InputLabel>
                  <Select 
                    value={editFormData.icon}
                    label="Icon"
                    onChange={(e) => setEditFormData(prev => ({ ...prev, icon: e.target.value }))}
                  >
                    {getAvailableIcons(selectedCategory?.icon).map((icon) => (
                      <MenuItem key={icon.value} value={icon.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {icon.label}
                          {icon.value === selectedCategory?.icon && (
                            <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                              (current)
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setEditDialogOpen(false);
              setSelectedCategory(null);
            }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updating}
              startIcon={updating ? <CircularProgress size={20} /> : <EditIcon />}
            >
              {updating ? 'Updating...' : 'Update Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The category will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete category "{selectedCategory?.displayName}"?
          </Typography>
          {selectedCategory?.actualDocumentCount > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This category has {selectedCategory.actualDocumentCount} documents. 
              Please move or delete documents first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting || (selectedCategory?.actualDocumentCount > 0)}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Category'}
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
          setSelectedCategory(menuCategory);
          setEditDialogOpen(true);
          handleMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Category
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleStatus(menuCategory);
          handleMenuClose();
        }}>
          {menuCategory?.isActive ? <VisibilityOffIcon sx={{ mr: 1 }} /> : <VisibilityIcon sx={{ mr: 1 }} />}
          {menuCategory?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSelectedCategory(menuCategory);
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          disabled={menuCategory?.actualDocumentCount > 0}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Category
        </MenuItem>
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add category"
        onClick={() => setCreateDialogOpen(true)}
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

export default CategoryManagement;