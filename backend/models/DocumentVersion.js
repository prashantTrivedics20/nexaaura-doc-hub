const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  version: {
    type: String,
    required: true
  },
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
    checksum: {
      type: String,
      required: true
    }
  },
  changes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  metadata: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String
  }
}, {
  timestamps: true
});

// Indexes
documentVersionSchema.index({ document: 1, version: 1 }, { unique: true });
documentVersionSchema.index({ document: 1, createdAt: -1 });
documentVersionSchema.index({ uploadedBy: 1 });

// Method to increment download count
documentVersionSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);