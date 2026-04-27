#!/usr/bin/env node

/**
 * Cleanup Non-Cloudinary Documents
 * Removes documents that don't have proper Cloudinary URLs
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Document = require('./models/Document');
const { connectDB } = require('./config/database');

const cleanupDocuments = async () => {
  try {
    await connectDB();
    console.log('🧹 Cleaning up non-Cloudinary documents...');
    console.log('');

    // Find documents with non-Cloudinary URLs
    const nonCloudinaryDocs = await Document.find({
      'file.url': { $not: /^https:\/\/res\.cloudinary\.com\// }
    });

    if (nonCloudinaryDocs.length === 0) {
      console.log('✅ All documents are using Cloudinary URLs');
      process.exit(0);
    }

    console.log(`Found ${nonCloudinaryDocs.length} documents with non-Cloudinary URLs:`);
    console.log('');

    nonCloudinaryDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   URL: ${doc.file.url}`);
      console.log(`   Size: ${Math.round(doc.file.size / 1024)}KB`);
      console.log('');
    });

    console.log('🗑️  Removing non-Cloudinary documents...');
    
    const result = await Document.deleteMany({
      'file.url': { $not: /^https:\/\/res\.cloudinary\.com\// }
    });

    console.log(`✅ Removed ${result.deletedCount} non-Cloudinary documents`);
    console.log('');
    console.log('🎯 Database is now clean for Cloudinary-only deployment!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanupDocuments();