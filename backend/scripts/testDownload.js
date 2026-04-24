// Test script to verify download endpoint returns proper PDF URLs
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios = require('axios');
const Document = require('../models/Document');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

async function testDownload() {
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

    // Get all documents
    const documents = await Document.find({ status: 'published' }).limit(3);
    if (documents.length === 0) {
      console.error('❌ No published documents found. Upload a document first.');
      process.exit(1);
    }

    console.log(`📄 Testing ${documents.length} documents:\n`);

    for (const doc of documents) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📄 Document:', doc.title);
      console.log('🆔 ID:', doc._id);
      console.log('📁 Original filename:', doc.file.originalName);
      console.log('🔗 Cloudinary URL:', doc.file.url);

      // Test download endpoint
      const downloadUrl = `http://localhost:5001/api/documents/${doc._id}/download`;
      
      try {
        const response = await axios.get(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        });

        console.log('✅ Status:', response.status);
        console.log('📥 Download URL:', response.data.downloadUrl);
        console.log('📎 Filename:', response.data.filename);

        // Check if filename has .pdf extension
        if (response.data.filename.toLowerCase().endsWith('.pdf')) {
          console.log('✅ Filename has .pdf extension');
        } else {
          console.log('⚠️  WARNING: Filename missing .pdf extension');
        }

        // Check if download URL contains fl_attachment flag
        if (response.data.downloadUrl.includes('fl_attachment')) {
          console.log('✅ Download URL has attachment flag');
        } else {
          console.log('⚠️  WARNING: Download URL missing attachment flag');
        }

        // Test if download URL is accessible
        try {
          const fileResponse = await axios.head(response.data.downloadUrl, {
            timeout: 10000
          });
          console.log('✅ Download URL accessible:', fileResponse.status);
          console.log('📦 Content-Type:', fileResponse.headers['content-type']);
          
          if (fileResponse.headers['content-disposition']) {
            console.log('📎 Content-Disposition:', fileResponse.headers['content-disposition']);
          }
        } catch (fileError) {
          console.error('❌ Download URL not accessible:', fileError.response?.status || fileError.message);
        }

      } catch (error) {
        console.error('❌ Download endpoint error:', error.response?.status || error.message);
        console.error('❌ Response:', error.response?.data);
      }

      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Testing Complete!\n');

    console.log('📝 Expected Results:');
    console.log('✅ Filename should end with .pdf');
    console.log('✅ Download URL should contain fl_attachment flag');
    console.log('✅ Download URL should be accessible (200 OK)');
    console.log('✅ Content-Type should be application/pdf\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

testDownload();
