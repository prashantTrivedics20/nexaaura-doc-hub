#!/usr/bin/env node

/**
 * Verify Server Configuration
 * Check if the server is using the correct upload configuration
 */

require('dotenv').config();

console.log('🔍 Verifying Server Configuration...');
console.log('');

console.log('📋 Environment Variables:');
console.log('  USE_LOCAL_STORAGE:', process.env.USE_LOCAL_STORAGE);
console.log('  MAX_FILE_SIZE:', process.env.MAX_FILE_SIZE);
console.log('  NODE_ENV:', process.env.NODE_ENV);

console.log('');
console.log('📁 Storage Configuration:');
if (process.env.USE_LOCAL_STORAGE === 'true') {
  console.log('  ✅ LOCAL STORAGE ENABLED');
  console.log('  📂 Files will be stored in: backend/uploads/documents/');
  console.log('  📏 File size limit: 20MB (configurable)');
  console.log('  🌐 Files served at: http://localhost:5001/uploads/documents/');
} else {
  console.log('  ☁️ CLOUDINARY STORAGE (10MB limit on free plan)');
  console.log('  ⚠️  This will cause issues with files > 10MB');
}

console.log('');
console.log('🧪 Testing Upload Modules:');
try {
  const { uploadDocument: cloudinaryUpload } = require('./config/cloudinary');
  console.log('  ✅ Cloudinary module loaded');
} catch (error) {
  console.log('  ❌ Cloudinary module error:', error.message);
}

try {
  const { uploadDocument: localUpload } = require('./config/localStorage');
  console.log('  ✅ Local storage module loaded');
} catch (error) {
  console.log('  ❌ Local storage module error:', error.message);
}

console.log('');
console.log('🎯 Expected Behavior:');
console.log('  - Files up to 20MB should upload successfully');
console.log('  - No Cloudinary 10MB limit errors');
console.log('  - Files stored locally in uploads folder');

console.log('');
console.log('🚀 If configuration looks correct, try uploading your 18MB file!');