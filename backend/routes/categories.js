const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Category = require('../models/Category');
const Document = require('../models/Document');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all categories (public endpoint for document upload)
router.get('/', optionalAuth, [
  query('includeInactive').optional().isBoolean(),
  query('withCounts').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const includeInactive = req.query.includeInactive === 'true';
    const withCounts = req.query.withCounts === 'true';

    let categories;

    if (withCounts) {
      // Get categories with actual document counts
      categories = await Category.getCategoriesWithCounts();
      
      if (!includeInactive) {
        categories = categories.filter(cat => cat.isActive);
      }
    } else {
      // Simple category fetch
      const filter = includeInactive ? {} : { isActive: true };
      categories = await Category.find(filter)
        .sort({ displayName: 1 })
        .select('name displayName description color icon isActive documentCount');
    }

    res.json({
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get actual document count
    const actualDocumentCount = await Document.countDocuments({ category: category.name });

    res.json({
      ...category.toObject(),
      actualDocumentCount
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch category' });
  }
});

// Create new category (Admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .toLowerCase()
    .matches(/^[a-z0-9-_]+$/)
    .withMessage('Name must contain only lowercase letters, numbers, hyphens, and underscores'),
  body('displayName')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Display name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .withMessage('Description must be less than 200 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Icon must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, displayName, description, color, icon } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({
      name,
      displayName,
      description: description || '',
      color: color || '#8B5CF6',
      icon: icon || 'folder',
      createdBy: req.user._id
    });

    await category.save();
    await category.populate('createdBy', 'username email');

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Category creation error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// Update category (Admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Display name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .withMessage('Description must be less than 200 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('icon')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Icon must be between 1 and 50 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if trying to deactivate a category with documents
    if (req.body.isActive === false) {
      const documentCount = await Document.countDocuments({ category: category.name });
      if (documentCount > 0) {
        return res.status(400).json({ 
          message: `Cannot deactivate category with ${documentCount} documents. Please move or delete documents first.` 
        });
      }
    }

    // Update fields
    const updateFields = ['displayName', 'description', 'color', 'icon', 'isActive'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        category[field] = req.body[field];
      }
    });

    await category.save();
    await category.populate('createdBy', 'username email');

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has documents
    const documentCount = await Document.countDocuments({ category: category.name });
    if (documentCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${documentCount} documents. Please move or delete documents first.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Category deleted successfully',
      deletedCategory: category.name
    });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

// Get category statistics (Admin only)
router.get('/admin/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });
    const inactiveCategories = await Category.countDocuments({ isActive: false });

    // Get categories with document counts
    const categoriesWithCounts = await Category.getCategoriesWithCounts();
    
    // Get most used categories
    const mostUsedCategories = categoriesWithCounts
      .filter(cat => cat.actualDocumentCount > 0)
      .sort((a, b) => b.actualDocumentCount - a.actualDocumentCount)
      .slice(0, 5);

    // Get unused categories
    const unusedCategories = categoriesWithCounts
      .filter(cat => cat.actualDocumentCount === 0)
      .length;

    res.json({
      overview: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        unusedCategories
      },
      mostUsedCategories,
      allCategories: categoriesWithCounts
    });
  } catch (error) {
    console.error('Category statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch category statistics' });
  }
});

// Bulk operations (Admin only)
router.post('/bulk', authenticateToken, requireAdmin, [
  body('action').isIn(['activate', 'deactivate', 'delete']).withMessage('Invalid bulk action'),
  body('categoryIds').isArray({ min: 1 }).withMessage('Category IDs must be a non-empty array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, categoryIds } = req.body;
    const results = {
      success: [],
      failed: []
    };

    for (const categoryId of categoryIds) {
      try {
        const category = await Category.findById(categoryId);
        if (!category) {
          results.failed.push({ categoryId, reason: 'Category not found' });
          continue;
        }

        if (action === 'delete' || action === 'deactivate') {
          const documentCount = await Document.countDocuments({ category: category.name });
          if (documentCount > 0) {
            results.failed.push({ 
              categoryId, 
              categoryName: category.displayName,
              reason: `Has ${documentCount} documents` 
            });
            continue;
          }
        }

        switch (action) {
          case 'activate':
            category.isActive = true;
            await category.save();
            break;
          case 'deactivate':
            category.isActive = false;
            await category.save();
            break;
          case 'delete':
            await Category.findByIdAndDelete(categoryId);
            break;
        }

        results.success.push({ 
          categoryId, 
          categoryName: category.displayName,
          action 
        });
      } catch (error) {
        results.failed.push({ 
          categoryId, 
          reason: error.message 
        });
      }
    }

    res.json({
      message: `Bulk ${action} completed`,
      results
    });
  } catch (error) {
    console.error('Bulk category operation error:', error);
    res.status(500).json({ message: 'Failed to perform bulk operation' });
  }
});

module.exports = router;