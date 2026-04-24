const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['policy', 'procedure', 'manual', 'report', 'contract', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  file: {
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    pages: Number // For PDF files
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['public', 'internal', 'restricted'],
    default: 'internal'
  },
  version: {
    type: String,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  metadata: {
    department: String,
    author: String,
    reviewDate: Date,
    approvedBy: String
  }
}, {
  timestamps: true
});

// Indexes for better search performance
documentSchema.index({ title: 'text', description: 'text', tags: 'text' });
documentSchema.index({ category: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: -1 });

// Virtual for file size in human readable format
documentSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.file.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to increment download count
documentSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

module.exports = mongoose.model('Document', documentSchema);