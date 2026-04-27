const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Document = require('../models/Document');
const User = require('../models/User');
const Category = require('../models/Category');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total documents count
    const totalDocuments = await Document.countDocuments({ isActive: true });

    // Get total categories count
    const totalCategories = await Document.distinct('category').then(categories => categories.length);

    // Get total downloads count
    const totalDownloads = await Document.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);

    // Calculate user progress (based on documents viewed/downloaded)
    const userDocuments = await Document.find({ 
      isActive: true,
      $or: [
        { 'analytics.views.userId': userId },
        { 'analytics.downloads.userId': userId }
      ]
    });

    const userProgress = totalDocuments > 0 
      ? Math.round((userDocuments.length / totalDocuments) * 100)
      : 0;

    // Get user's recent activity
    const recentActivity = await Document.find({
      isActive: true,
      $or: [
        { 'analytics.views.userId': userId },
        { 'analytics.downloads.userId': userId }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title category updatedAt');

    // Get popular categories
    const popularCategories = await Document.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        downloads: { $sum: '$downloadCount' }
      }},
      { $sort: { downloads: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalDocuments,
      totalCategories,
      totalDownloads: totalDownloads[0]?.total || 0,
      userProgress,
      recentActivity,
      popularCategories
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get admin statistics
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get comprehensive admin stats
    const [
      totalUsers,
      totalDocuments,
      totalCategories,
      premiumUsers,
      recentUsers,
      topDocuments,
      categoryStats,
      monthlyStats
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Document.countDocuments({ isActive: true }),
      Document.distinct('category').then(categories => categories.length),
      User.countDocuments({ isPremium: true, isActive: true }),
      User.find({ isActive: true }).sort({ createdAt: -1 }).limit(10).select('username email createdAt isPremium'),
      Document.find({ isActive: true }).sort({ downloadCount: -1 }).limit(10).select('title category downloadCount'),
      Document.aggregate([
        { $match: { isActive: true } },
        { $group: { 
          _id: '$category', 
          count: { $sum: 1 },
          downloads: { $sum: '$downloadCount' }
        }},
        { $sort: { count: -1 } }
      ]),
      getMonthlyStats()
    ]);

    res.json({
      overview: {
        totalUsers,
        totalDocuments,
        totalCategories,
        premiumUsers
      },
      recentUsers,
      topDocuments,
      categoryStats,
      monthlyStats
    });

  } catch (error) {
    console.error('Admin stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics' });
  }
});

// Helper function to get monthly statistics
async function getMonthlyStats() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyUsers = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const monthlyDocuments = await Document.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return {
    users: monthlyUsers,
    documents: monthlyDocuments
  };
}

// Get category-specific statistics
router.get('/category/:categoryId', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.params;

    const categoryStats = await Document.aggregate([
      { $match: { category: categoryId, isActive: true } },
      { $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalDownloads: { $sum: '$downloadCount' },
        avgFileSize: { $avg: '$file.size' }
      }}
    ]);

    const topDocuments = await Document.find({ 
      category: categoryId, 
      isActive: true 
    })
    .sort({ downloadCount: -1 })
    .limit(10)
    .select('title downloadCount createdAt');

    res.json({
      category: categoryId,
      stats: categoryStats[0] || {
        totalDocuments: 0,
        totalDownloads: 0,
        avgFileSize: 0
      },
      topDocuments
    });

  } catch (error) {
    console.error('Category stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch category statistics' });
  }
});

module.exports = router;