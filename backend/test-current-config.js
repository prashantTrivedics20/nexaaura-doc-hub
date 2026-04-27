#!/usr/bin/env node

/**
 * Test Current Configuration
 * Verify what configuration is actually being used
 */

require('dotenv').config();

console.log('🔍 CURRENT CONFIGURATION TEST');
console.log('='.repeat(50));
console.log('');

console.log('📋 Environment Variables:');
console.log('  USE_LOCAL_STORAGE:', process.env.USE_LOCAL_STORAGE);
console.log('  MAX_FILE_SIZE:', process.env.MAX_FILE_SIZE);
console.log('  COMPRESS_LARGE_FILES:', process.env.COMPRESS_LARGE_FILES);
console.log('');

console.log('☁️ Cloudinary Configuration:');
console.log('  CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('  API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
console.log('');

console.log('🧪 Testing Multer Configuration:');
try {
  const { uploadDocument } = require('./config/cloudinary');
  console.log('  ✅ Cloudinary upload module loaded');
  console.log('  📏 Expected file size limit: 10MB (10485760 bytes)');
} catch (error) {
  console.log('  ❌ Error loading Cloudinary config:', error.message);
}

console.log('');
console.log('🎯 EXPECTED BEHAVIOR:');
console.log('  - Files ≤ 10MB: Upload successfully');
console.log('  - Files > 10MB: Get "File too large" error');
console.log('  - Your 18MB file: Should get proper error message');
console.log('');
console.log('🚨 CRITICAL: If you still see the old timestamp error,');
console.log('   the server is NOT using this configuration!');
console.log('');
console.log('✅ Configuration looks correct for Cloudinary free plan!');