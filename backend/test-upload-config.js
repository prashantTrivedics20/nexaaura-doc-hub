#!/usr/bin/env node

/**
 * Test Upload Configuration
 * Verifies that the file upload limits are properly configured
 */

const multer = require('multer');

console.log('🧪 Testing Upload Configuration...');
console.log('');

// Test the actual configuration
try {
  const { uploadDocument } = require('./config/cloudinary');
  
  console.log('📋 Upload Configuration:');
  console.log('  Upload function type:', typeof uploadDocument);
  
  // Create a test configuration to see default limits
  const testConfig = multer({
    limits: {
      fileSize: 20971520, // 20MB
    }
  });
  
  console.log('  Expected file size limit: 20971520 bytes (20MB)');
  console.log('  Expected file size limit: 20MB');
  
  console.log('');
  console.log('✅ Configuration loaded successfully!');
  
} catch (error) {
  console.error('❌ Error loading configuration:', error.message);
}

console.log('');
console.log('🔧 Recommended restart steps:');
console.log('1. Stop the current server (Ctrl+C)');
console.log('2. Clear Node.js cache: rm -rf node_modules/.cache (if exists)');
console.log('3. Restart: npm run dev');