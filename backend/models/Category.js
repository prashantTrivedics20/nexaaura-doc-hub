const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 50
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  color: {
    type: String,
    default: '#8B5CF6',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  icon: {
    type: String,
    default: 'folder',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documentCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
categorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ createdAt: -1 });

// Virtual for formatted display
categorySchema.virtual('formattedName').get(function() {
  return this.displayName || this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

// Method to increment document count
categorySchema.methods.incrementDocumentCount = function() {
  this.documentCount += 1;
  return this.save();
};

// Method to decrement document count
categorySchema.methods.decrementDocumentCount = function() {
  if (this.documentCount > 0) {
    this.documentCount -= 1;
  }
  return this.save();
};

// Static method to get active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ displayName: 1 });
};

// Static method to get categories with document counts
categorySchema.statics.getCategoriesWithCounts = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'documents',
        localField: 'name',
        foreignField: 'category',
        as: 'documents'
      }
    },
    {
      $addFields: {
        actualDocumentCount: { $size: '$documents' }
      }
    },
    {
      $project: {
        documents: 0
      }
    },
    {
      $sort: { displayName: 1 }
    }
  ]);
};

module.exports = mongoose.model('Category', categorySchema);