// Test script to check if we can fetch PDFs from Cloudinary
const https = require('https');
const http = require('http');

// Test Cloudinary URL - replace with actual URL from your database
const testUrl = 'https://res.cloudinary.com/dqjazvvp5/image/upload/v1776944639/nexa-doc-hub/documents/React1-1776944635504.pdf';

console.log('Testing Cloudinary URL:', testUrl);
console.log('---');

const protocol = testUrl.startsWith('https') ? https : http;

protocol.get(testUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  console.log('---');
  
  if (res.statusCode === 200) {
    console.log('✅ SUCCESS: PDF is accessible from Cloudinary');
    
    let dataLength = 0;
    res.on('data', (chunk) => {
      dataLength += chunk.length;
    });
    
    res.on('end', () => {
      console.log('Total bytes received:', dataLength);
      console.log('Content-Type:', res.headers['content-type']);
    });
  } else if (res.statusCode === 401) {
    console.log('❌ ERROR: 401 Unauthorized - File is private on Cloudinary');
    console.log('SOLUTION: Files uploaded before config change are private.');
    console.log('You need to either:');
    console.log('1. Delete old documents and re-upload them');
    console.log('2. Or make existing files public in Cloudinary dashboard');
  } else if (res.statusCode === 404) {
    console.log('❌ ERROR: 404 Not Found - File does not exist');
  } else {
    console.log('❌ ERROR: Unexpected status code');
  }
}).on('error', (error) => {
  console.error('❌ Network Error:', error.message);
});
