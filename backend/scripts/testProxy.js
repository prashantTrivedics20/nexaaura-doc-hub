// Test the proxy endpoint
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const axios = require('axios');

async function testProxy() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Document = require('../models/Document');
    const User = require('../models/User');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@nexa.com' });
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Generate token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET);

    // Get first document
    const document = await Document.findOne({});
    if (!document) {
      console.log('❌ No documents found');
      process.exit(1);
    }

    console.log('📄 Testing Document:');
    console.log(`  Title: ${document.title}`);
    console.log(`  ID: ${document._id}`);
    console.log(`  URL: ${document.file.url}\n`);

    // Test proxy endpoint
    const proxyUrl = `http://localhost:5001/api/documents/${document._id}/proxy?token=${token}`;
    console.log('🌐 Testing Proxy Endpoint:');
    console.log(`  ${proxyUrl}\n`);

    try {
      const response = await axios.get(proxyUrl, {
        responseType: 'arraybuffer',
        maxRedirects: 5,
        timeout: 30000
      });

      console.log('✅ Proxy Response:');
      console.log(`  Status: ${response.status}`);
      console.log(`  Content-Type: ${response.headers['content-type']}`);
      console.log(`  Content-Length: ${response.data.length} bytes`);
      
      if (response.status === 200 && response.data.length > 0) {
        console.log('\n✅ SUCCESS! Proxy is working correctly!');
        console.log('📝 The PDF can be accessed through the proxy.');
      } else {
        console.log('\n⚠️  WARNING: Proxy returned empty response');
      }
    } catch (proxyError) {
      console.error('\n❌ Proxy Error:');
      console.error(`  Status: ${proxyError.response?.status}`);
      console.error(`  Message: ${proxyError.message}`);
      if (proxyError.response?.data) {
        console.error(`  Data: ${proxyError.response.data.toString()}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testProxy();
