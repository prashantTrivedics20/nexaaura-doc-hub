// Script to make all existing Cloudinary files public
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Document = require('../models/Document');

async function makeFilesPublic() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all documents
    const documents = await Document.find({});
    console.log(`📄 Found ${documents.length} documents\n`);

    if (documents.length === 0) {
      console.log('No documents to process');
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        console.log(`Processing: ${doc.title}`);
        console.log(`  Public ID: ${doc.file.publicId}`);
        
        // Determine resource type based on file
        let resourceType = 'raw'; // Default for PDFs and documents
        if (doc.file.mimeType?.includes('image')) {
          resourceType = 'image';
        } else if (doc.file.mimeType?.includes('video')) {
          resourceType = 'video';
        }
        
        console.log(`  Resource Type: ${resourceType}`);
        
        // Update the resource to make it public
        const result = await cloudinary.uploader.explicit(doc.file.publicId, {
          type: 'upload',
          resource_type: resourceType,
          access_mode: 'public'
        });

        console.log(`  ✅ Success - New URL: ${result.secure_url}\n`);
        
        // Update document with new URL if changed
        if (result.secure_url !== doc.file.url) {
          doc.file.url = result.secure_url;
          await doc.save();
          console.log(`  📝 Updated document URL in database\n`);
        }
        
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

    if (successCount > 0) {
      console.log('✅ Files are now public! Test the PDF viewer again.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

makeFilesPublic();
