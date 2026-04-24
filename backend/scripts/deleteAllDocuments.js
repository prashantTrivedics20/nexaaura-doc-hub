// Script to delete all documents from database and Cloudinary
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Document = require('../models/Document');

async function deleteAllDocuments() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const documents = await Document.find({});
    console.log(`📄 Found ${documents.length} documents to delete\n`);

    if (documents.length === 0) {
      console.log('No documents to delete');
      process.exit(0);
    }

    console.log('⚠️  WARNING: This will permanently delete all documents!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    let successCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        console.log(`Deleting: ${doc.title}`);
        console.log(`  Public ID: ${doc.file.publicId}`);
        
        // Try to delete from Cloudinary (try both image and raw)
        try {
          await cloudinary.uploader.destroy(doc.file.publicId, { resource_type: 'image' });
          console.log(`  ✅ Deleted from Cloudinary (image)`);
        } catch (e1) {
          try {
            await cloudinary.uploader.destroy(doc.file.publicId, { resource_type: 'raw' });
            console.log(`  ✅ Deleted from Cloudinary (raw)`);
          } catch (e2) {
            console.log(`  ⚠️  Could not delete from Cloudinary (file may not exist)`);
          }
        }
        
        // Delete from database
        await Document.findByIdAndDelete(doc._id);
        console.log(`  ✅ Deleted from database\n`);
        
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`  ✅ Success: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📄 Total: ${documents.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ All documents deleted!');
    console.log('📝 Now you can re-upload documents through the admin panel.');
    console.log('   New uploads will be public and accessible.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

deleteAllDocuments();
