// Test script to verify PDF proxy endpoint
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios = require('axios');
const Document = require('../models/Document');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

async function testPdfProxy() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@nexa.com' });
    if (!admin) {
      console.error('❌ Admin user not found. Run seedAdmin.js first.');
      process.exit(1);
    }

    // Generate token
    const token = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('👤 Admin User:', admin.email);
    console.log('🔑 Token generated\n');

    // Get first document
    const document = await Document.findOne({ status: 'published' });
    if (!document) {
      console.error('❌ No published documents found. Upload a document first.');
      process.exit(1);
    }

    console.log('📄 Testing Document:');
    console.log('  Title:', document.title);
    console.log('  ID:', document._id);
    console.log('  Public ID:', document.file.publicId);
    console.log('  Cloudinary URL:', document.file.url);
    console.log('  MIME Type:', document.file.mimeType);
    console.log('  Size:', Math.round(document.file.size / 1024), 'KB\n');

    // Test 1: Direct Cloudinary access
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 1: Direct Cloudinary Access');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const directResponse = await axios.head(document.file.url, {
        timeout: 10000
      });
      console.log('✅ Status:', directResponse.status);
      console.log('✅ Content-Type:', directResponse.headers['content-type']);
      console.log('✅ Content-Length:', directResponse.headers['content-length'], 'bytes');
      console.log('✅ Direct access works!\n');
    } catch (directError) {
      console.error('❌ Status:', directError.response?.status);
      console.error('❌ Error:', directError.message);
      console.error('❌ Direct access failed - File may be private\n');
    }

    // Test 2: Proxy endpoint
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 2: Backend Proxy Endpoint');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const proxyUrl = `http://localhost:5001/api/documents/${document._id}/proxy?token=${encodeURIComponent(token)}`;
    console.log('🔗 Proxy URL:', proxyUrl);
    
    try {
      const proxyResponse = await axios.head(proxyUrl, {
        timeout: 10000
      });
      console.log('✅ Status:', proxyResponse.status);
      console.log('✅ Content-Type:', proxyResponse.headers['content-type']);
      console.log('✅ Content-Length:', proxyResponse.headers['content-length'], 'bytes');
      console.log('✅ CORS Headers:', proxyResponse.headers['access-control-allow-origin']);
      console.log('✅ Proxy endpoint works!\n');
    } catch (proxyError) {
      console.error('❌ Status:', proxyError.response?.status);
      console.error('❌ Error:', proxyError.message);
      console.error('❌ Response:', proxyError.response?.data);
      console.error('❌ Proxy endpoint failed\n');
    }

    // Test 3: Download endpoint
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('TEST 3: Download Endpoint');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const downloadUrl = `http://localhost:5001/api/documents/${document._id}/download`;
    console.log('🔗 Download URL:', downloadUrl);
    
    try {
      const downloadResponse = await axios.get(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      console.log('✅ Status:', downloadResponse.status);
      console.log('✅ Download URL:', downloadResponse.data.downloadUrl);
      console.log('✅ Filename:', downloadResponse.data.filename);
      
      // Test if download URL is accessible
      try {
        const downloadFileResponse = await axios.head(downloadResponse.data.downloadUrl, {
          timeout: 10000
        });
        console.log('✅ Download file accessible:', downloadFileResponse.status);
        console.log('✅ Download endpoint works!\n');
      } catch (downloadFileError) {
        console.error('❌ Download file not accessible:', downloadFileError.response?.status);
        console.error('❌ Download URL may be invalid\n');
      }
    } catch (downloadError) {
      console.error('❌ Status:', downloadError.response?.status);
      console.error('❌ Error:', downloadError.message);
      console.error('❌ Download endpoint failed\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Testing Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 Next Steps:');
    console.log('1. If direct Cloudinary access fails (401), run: node backend/scripts/makeFilesPublic.js');
    console.log('2. If proxy works, test in browser at: http://localhost:3000');
    console.log('3. Check backend logs for detailed error messages\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

testPdfProxy();
