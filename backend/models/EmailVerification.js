const mongoose = require('mongoose');

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset'],
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for automatic cleanup
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailVerificationSchema.index({ email: 1, purpose: 1 });

// Method to generate OTP
emailVerificationSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Method to verify OTP
emailVerificationSchema.methods.verifyOTP = function(inputOTP) {
  if (this.isUsed) {
    throw new Error('OTP has already been used');
  }
  
  if (this.expiresAt < new Date()) {
    throw new Error('OTP has expired');
  }
  
  if (this.attempts >= 5) {
    throw new Error('Maximum verification attempts exceeded');
  }
  
  this.attempts += 1;
  
  if (this.otp !== inputOTP) {
    this.save();
    throw new Error('Invalid OTP');
  }
  
  this.isUsed = true;
  return this.save();
};

module.exports = mongoose.model('EmailVerification', emailVerificationSchema);