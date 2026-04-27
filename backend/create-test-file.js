#!/usr/bin/env node

/**
 * Create Test File
 * Creates a small PDF-like file for testing uploads
 */

const fs = require('fs');
const path = require('path');

console.log('📄 Creating test file for upload...');

// Create a simple text file that's under 10MB
const testContent = `
NEXA DOCUMENT HUB - TEST FILE
============================

This is a test document for upload testing.
File size: Small (under 10MB)
Created: ${new Date().toISOString()}

This file should upload successfully to Cloudinary.

Content repeated to make it a reasonable size:
${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(1000)}

End of test document.
`;

const testFilePath = path.join(__dirname, 'test-document.txt');

try {
  fs.writeFileSync(testFilePath, testContent);
  const stats = fs.statSync(testFilePath);
  const fileSizeKB = Math.round(stats.size / 1024);
  
  console.log('✅ Test file created successfully!');
  console.log(`📁 File: ${testFilePath}`);
  console.log(`📏 Size: ${fileSizeKB}KB (${stats.size} bytes)`);
  console.log('');
  console.log('🧪 Use this file to test uploads:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Login to admin panel');
  console.log('3. Upload this test file');
  console.log('4. Should work perfectly!');
  
} catch (error) {
  console.error('❌ Error creating test file:', error.message);
}