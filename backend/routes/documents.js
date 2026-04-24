const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Document = require('../models/Document');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadDocument, deleteFromCloudinary } = require('../config/cloudinary');

const router = express.Router();

// Upload new document (Admin only)
router.post('/upload', authenticateToken, requireAdmin, uploadDocument.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const {
      title,
      description,
      category,
      tags,
      isPublic,
      accessLevel,
      version,
      department,
      author,
      reviewDate,
      approvedBy,
      expiryDate
    } = req.body;

    // Parse tags if it's a string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    const document = new Document({
      title: title || req.file.originalname,
      description: description || '',
      category: category || 'other',
      tags: parsedTags,
      file: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      },
      uploadedBy: req.user._id,
      isPublic: isPublic === 'true',
      accessLevel: accessLevel || 'internal',
      version: version || '1.0',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      metadata: {
        department: department || '',
        author: author || '',
        reviewDate: reviewDate ? new Date(reviewDate) : null,
        approvedBy: approvedBy || ''
      }
    });

    await document.save();
    await document.populate('uploadedBy', 'username email profile');

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Document upload error:', error);
    
    // Clean up uploaded file if document creation fails
    if (req.file && req.file.filename) {
      try {
        await deleteFromCloudinary(req.file.filename);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'Document with this title already exists' });
    }
    
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Get all documents with pagination and filtering
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['policy', 'procedure', 'manual', 'report', 'contract', 'other']),
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('search').optional().isLength({ min: 1 })
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

    // For non-admin users, only show published documents
    // But show ALL published documents (not filtered by isPublic)
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'published';
    }

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Status filter (admin can override)
    if (req.query.status && req.user && req.user.role === 'admin') {
      filter.status = req.query.status;
    }

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Execute query with population
    const documents = await Document.find(filter)
      .populate('uploadedBy', 'username email profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Document.countDocuments(filter);

    res.json({
      documents,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Get document by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'username email profile');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if document is published (or user is admin)
    if (document.status !== 'published' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Document not available' });
    }

    // All authenticated users can see document metadata
    // But only premium users can view/download content
    const response = {
      document,
      canView: req.user.isPremium || req.user.role === 'admin'
    };

    res.json(response);
  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// Update document (Admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('category').optional().isIn(['policy', 'procedure', 'manual', 'report', 'contract', 'other']),
  body('status').optional().isIn(['draft', 'published', 'archived'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update fields
    const updateFields = [
      'title', 'description', 'category', 'tags', 'isPublic', 
      'accessLevel', 'version', 'status', 'expiryDate'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'tags' && typeof req.body[field] === 'string') {
          document[field] = req.body[field].split(',').map(tag => tag.trim());
        } else if (field === 'expiryDate' && req.body[field]) {
          document[field] = new Date(req.body[field]);
        } else {
          document[field] = req.body[field];
        }
      }
    });

    // Update metadata
    if (req.body.metadata) {
      Object.keys(req.body.metadata).forEach(key => {
        if (req.body.metadata[key] !== undefined) {
          document.metadata[key] = req.body.metadata[key];
        }
      });
    }

    await document.save();
    await document.populate('uploadedBy', 'username email profile');

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Document update error:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// Delete document (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from Cloudinary
    try {
      await deleteFromCloudinary(document.file.publicId);
    } catch (cloudinaryError) {
      console.error('Failed to delete file from Cloudinary:', cloudinaryError);
      // Continue with document deletion even if Cloudinary deletion fails
    }

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Download document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if document is published
    if (document.status !== 'published' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Document not available' });
    }

    // Check premium access - only premium users and admins can download
    if (!req.user.isPremium && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Premium access required',
        requiresPremium: true 
      });
    }

    // Increment download count
    await document.incrementDownload();

    console.log('📥 Download request for:', document.title);
    console.log('📁 Public ID:', document.file.publicId);
    console.log('📄 Original filename:', document.file.originalName);

    // For raw files (PDFs), we'll use the direct URL and let the frontend handle the download
    // Cloudinary's fl_attachment doesn't work reliably with raw resource type
    
    // Ensure filename has .pdf extension
    let filename = document.file.originalName;
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename = filename + '.pdf';
    }

    // Use the direct Cloudinary URL - the frontend will handle forcing the download
    const downloadUrl = document.file.url;

    console.log('🔗 Download URL:', downloadUrl);
    console.log('📎 Filename:', filename);

    // Return download URL with proper filename
    res.json({
      downloadUrl: downloadUrl,
      filename: filename
    });
  } catch (error) {
    console.error('❌ Document download error:', error);
    res.status(500).json({ message: 'Failed to process download' });
  }
});

// View document (proxy for CORS)
router.get('/:id/view', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if document is published
    if (document.status !== 'published' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Document not available' });
    }

    // Check premium access - only premium users and admins can view
    if (!req.user.isPremium && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Premium access required',
        requiresPremium: true 
      });
    }

    // Redirect to Cloudinary URL with proper headers
    res.redirect(document.file.url);
  } catch (error) {
    console.error('Document view error:', error);
    res.status(500).json({ message: 'Failed to process view request' });
  }
});

// Proxy endpoint to fetch PDF with CORS headers
router.get('/:id/proxy', async (req, res) => {
  // Mark to skip monitoring middleware
  res.locals.skipMonitoring = true;

  try {
    // Get token from query parameter or Authorization header
    let token = req.query.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token manually
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get user from token
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if document is published
    if (document.status !== 'published' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Document not available' });
    }

    // Check premium access
    if (!user.isPremium && user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Premium access required',
        requiresPremium: true 
      });
    }

    console.log('📄 Proxying PDF:', document.title);
    console.log('🔗 Cloudinary URL:', document.file.url);

    // Use axios to fetch from Cloudinary
    const axios = require('axios');
    
    try {
      // Fetch from Cloudinary with proper configuration
      const response = await axios.get(document.file.url, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5,
        timeout: 30000 // 30 second timeout
      });

      console.log('✅ Cloudinary response status:', response.status);
      console.log('📦 Content-Type:', response.headers['content-type']);
      console.log('📏 Content-Length:', response.headers['content-length']);

      // Set response headers BEFORE piping
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');
      
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }

      // Pipe the response stream
      response.data.pipe(res);

      // Handle stream errors
      response.data.on('error', (streamError) => {
        console.error('❌ Stream error:', streamError.message);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Stream error' });
        }
      });
      
    } catch (fetchError) {
      console.error('❌ Error fetching from Cloudinary:', fetchError.message);
      console.error('Status:', fetchError.response?.status);
      console.error('Data:', fetchError.response?.data);
      
      if (!res.headersSent) {
        if (fetchError.response?.status === 401) {
          res.status(500).json({ 
            message: 'File is private on Cloudinary. Please re-upload the document.',
            code: 'CLOUDINARY_PRIVATE_FILE'
          });
        } else if (fetchError.response?.status === 404) {
          res.status(404).json({ 
            message: 'File not found on Cloudinary',
            code: 'CLOUDINARY_FILE_NOT_FOUND'
          });
        } else {
          res.status(500).json({ 
            message: 'Failed to fetch document from storage',
            code: 'CLOUDINARY_FETCH_ERROR'
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Document proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to process request' });
    }
  }
});

// Get document statistics (Admin only)
router.get('/admin/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Document.aggregate([
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalDownloads: { $sum: '$downloadCount' },
          avgFileSize: { $avg: '$file.size' },
          categoryCounts: {
            $push: '$category'
          }
        }
      }
    ]);

    const categoryStats = await Document.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUploads = await Document.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt uploadedBy category');

    res.json({
      overview: stats[0] || {
        totalDocuments: 0,
        totalDownloads: 0,
        avgFileSize: 0
      },
      categoryBreakdown: categoryStats,
      recentUploads
    });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;