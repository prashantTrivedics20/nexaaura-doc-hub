const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    default: 'General',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Static method to get setting value
adminSettingsSchema.statics.getSetting = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key: key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting value
adminSettingsSchema.statics.setSetting = async function(key, value, description = '', updatedBy = null) {
  const setting = await this.findOneAndUpdate(
    { key: key },
    { 
      value: value, 
      description: description,
      updatedBy: updatedBy 
    },
    { 
      upsert: true, 
      new: true 
    }
  );
  return setting;
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);