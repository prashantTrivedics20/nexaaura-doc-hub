const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Document = require('../models/Document');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadAvatar, deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1 }),
  query('role').optional().isIn(['admin', 'user']),
  query('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { 'profile.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'profile.lastName': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's document statistics
    const documentStats = await Document.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const recentDocuments = await Document.find({ uploadedBy: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt downloadCount');

    res.json({
      user,
      statistics: documentStats[0] || {
        totalDocuments: 0,
        totalDownloads: 0,
        categories: []
      },
      recentDocuments
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'user']),
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      profile: {
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('username').optional().isLength({ min: 3 }).trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'user']),
  body('isActive').optional().isBoolean(),
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString() && req.body.isActive === false) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    // Check for duplicate username/email if being updated
    if (req.body.username || req.body.email) {
      const duplicateFilter = {
        _id: { $ne: user._id }
      };

      if (req.body.username) {
        duplicateFilter.username = req.body.username;
      }
      if (req.body.email) {
        duplicateFilter.email = req.body.email;
      }

      const existingUser = await User.findOne(duplicateFilter);
      if (existingUser) {
        return res.status(400).json({
          message: req.body.email && existingUser.email === req.body.email 
            ? 'Email already in use' 
            : 'Username already taken'
        });
      }
    }

    // Update user fields
    const updateFields = ['username', 'email', 'role', 'isActive'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Update profile fields
    const profileFields = ['firstName', 'lastName', 'phone'];
    profileFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user.profile[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Get user's documents to clean up files
    const userDocuments = await Document.find({ uploadedBy: user._id });

    // Delete user's documents and their files from Cloudinary
    for (const doc of userDocuments) {
      try {
        await deleteFromCloudinary(doc.file.publicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete file from Cloudinary:', cloudinaryError);
      }
    }

    // Delete all user's documents
    await Document.deleteMany({ uploadedBy: user._id });

    // Delete user's avatar if exists
    if (user.profile.avatar) {
      try {
        // Extract public ID from avatar URL
        const publicId = user.profile.avatar.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`nexa-doc-hub/avatars/${publicId}`);
      } catch (avatarError) {
        console.error('Failed to delete avatar:', avatarError);
      }
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'User and associated data deleted successfully',
      deletedDocuments: userDocuments.length
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Upload user avatar
router.post('/:id/avatar', authenticateToken, requireAdmin, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.profile.avatar) {
      try {
        const oldPublicId = user.profile.avatar.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`nexa-doc-hub/avatars/${oldPublicId}`);
      } catch (deleteError) {
        console.error('Failed to delete old avatar:', deleteError);
      }
    }

    // Update user avatar
    user.profile.avatar = req.file.path;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: req.file.path
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Get user dashboard statistics
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's document statistics
    const userStats = await Document.aggregate([
      { $match: { uploadedBy: userId } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' },
          totalSize: { $sum: '$file.size' }
        }
      }
    ]);

    // Get category breakdown
    const categoryStats = await Document.aggregate([
      { $match: { uploadedBy: userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentDocuments = await Document.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt downloadCount status');

    res.json({
      overview: userStats[0] || {
        totalDocuments: 0,
        totalDownloads: 0,
        totalSize: 0
      },
      categoryBreakdown: categoryStats,
      recentActivity: recentDocuments
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Get admin dashboard statistics (Admin only)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get overall statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    const totalDocuments = await Document.countDocuments();
    const publishedDocuments = await Document.countDocuments({ status: 'published' });
    const draftDocuments = await Document.countDocuments({ status: 'draft' });
    
    // Get total downloads
    const downloadStats = await Document.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloadCount' },
          avgFileSize: { $avg: '$file.size' }
        }
      }
    ]);

    // Get category breakdown
    const categoryStats = await Document.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          downloads: { $sum: '$downloadCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get recent documents
    const recentDocuments = await Document.find()
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt downloadCount status uploadedBy');

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role isActive createdAt lastLogin');

    // Get top downloaded documents
    const topDocuments = await Document.find()
      .populate('uploadedBy', 'username')
      .sort({ downloadCount: -1 })
      .limit(5)
      .select('title category downloadCount uploadedBy');

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        totalDocuments,
        publishedDocuments,
        draftDocuments,
        totalDownloads: downloadStats[0]?.totalDownloads || 0,
        avgFileSize: downloadStats[0]?.avgFileSize || 0
      },
      categoryBreakdown: categoryStats,
      recentDocuments,
      recentUsers,
      topDocuments
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics' });
  }
});

// Get analytics data (Admin only)
router.get('/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get user registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get document upload trends (last 30 days)
    const documentTrends = await Document.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get download trends (last 30 days)
    const downloadTrends = await Document.aggregate([
      {
        $match: {
          updatedAt: { $gte: thirtyDaysAgo },
          downloadCount: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            day: { $dayOfMonth: '$updatedAt' }
          },
          downloads: { $sum: '$downloadCount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get storage usage by category
    const storageByCategory = await Document.aggregate([
      {
        $group: {
          _id: '$category',
          totalSize: { $sum: '$file.size' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSize: -1 } }
    ]);

    res.json({
      userTrends,
      documentTrends,
      downloadTrends,
      storageByCategory
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

module.exports = router;