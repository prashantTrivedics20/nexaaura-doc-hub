// Script to check what documents exist in the database
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Document = require('../models/Document');

async function checkDocuments() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const documents = await Document.find({});
    console.log(`📄 Found ${documents.length} documents\n`);

    documents.forEach((doc, index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Document ${index + 1}:`);
      console.log(`  ID: ${doc._id}`);
      console.log(`  Title: ${doc.title}`);
      console.log(`  Category: ${doc.category}`);
      console.log(`  Status: ${doc.status}`);
      console.log(`  File:`);
      console.log(`    URL: ${doc.file.url}`);
      console.log(`    Public ID: ${doc.file.publicId}`);
      console.log(`    Original Name: ${doc.file.originalName}`);
      console.log(`    MIME Type: ${doc.file.mimeType}`);
      console.log(`    Size: ${doc.file.size} bytes`);
      console.log(`  Created: ${doc.createdAt}`);
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDocuments();
