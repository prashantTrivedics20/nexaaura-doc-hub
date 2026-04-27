#!/usr/bin/env node

/**
 * Test Cloudinary Limits
 * Check what limits are actually applied
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary first
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔍 Testing Cloudinary Configuration...');
console.log('');

// Check Cloudinary config
console.log('📋 Cloudinary Config:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

// Check account limits
cloudinary.api.usage()
  .then(result => {
    console.log('');
    console.log('📊 Account Usage & Limits:');
    console.log('  Plan:', result.plan || 'Unknown');
    console.log('  Credits Used:', result.credits?.used || 'Unknown');
    console.log('  Credits Limit:', result.credits?.limit || 'Unknown');
    console.log('  Storage Used:', result.storage?.used || 'Unknown');
    console.log('  Storage Limit:', result.storage?.limit || 'Unknown');
    console.log('  Bandwidth Used:', result.bandwidth?.used || 'Unknown');
    console.log('  Bandwidth Limit:', result.bandwidth?.limit || 'Unknown');
    
    console.log('');
    console.log('💡 Important Notes:');
    console.log('  - Cloudinary Free Plan has 10MB file size limit');
    console.log('  - This is a service-side limit, not configurable');
    console.log('  - To upload 18MB+ files, you need a paid plan');
    console.log('  - Alternative: Use chunked uploads or compress files');
  })
  .catch(error => {
    console.error('❌ Error checking Cloudinary limits:', error.message);
    
    console.log('');
    console.log('💡 Cloudinary Free Plan Limits (Standard):');
    console.log('  - File size: 10MB maximum');
    console.log('  - This explains the 10485760 bytes (10MB) limit');
    console.log('  - Your 18MB file exceeds this limit');
  });