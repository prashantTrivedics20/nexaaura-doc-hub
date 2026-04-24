// Test script to generate and verify signed URLs
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Document = require('../models/Document');

async function testSignedUrl() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the first document
    const document = await Document.findOne({});
    
    if (!document) {
      console.log('❌ No documents found in database');
      process.exit(1);
    }

    console.log('📄 Document Found:');
    console.log(`  Title: ${document.title}`);
    console.log(`  Public ID: ${document.file.publicId}`);
    console.log(`  Original URL: ${document.file.url}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 1: Generate signed URL for viewing
    console.log('🔐 Generating Signed URL for Viewing...');
    const publicIdWithExt = document.file.publicId + '.pdf';
    
    const signedUrl = cloudinary.url(publicIdWithExt, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      format: 'pdf'
    });
    
    console.log('✅ Signed URL Generated:');
    console.log(signedUrl);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 2: Generate signed URL for download
    console.log('📥 Generating Signed URL for Download...');
    const downloadUrl = cloudinary.url(document.file.publicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      attachment: true,
      flags: 'attachment:' + document.file.originalName
    });
    
    console.log('✅ Download URL Generated:');
    console.log(downloadUrl);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test 3: Try to fetch the signed URL
    console.log('🌐 Testing if signed URL is accessible...');
    const https = require('https');
    
    https.get(signedUrl, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Status Message: ${res.statusMessage}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Content-Length: ${res.headers['content-length']} bytes`);
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS! Signed URL is working!');
        console.log('📝 The PDF can be accessed using this signed URL.');
      } else {
        console.log('\n❌ ERROR! Signed URL returned non-200 status.');
      }
      
      process.exit(0);
    }).on('error', (error) => {
      console.error('\n❌ Network Error:', error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSignedUrl();
