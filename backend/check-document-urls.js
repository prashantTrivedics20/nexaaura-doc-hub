#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();
const Document = require('./models/Document');
const { connectDB } = require('./config/database');

const checkDocuments = async () => {
  try {
    await connectDB();
    console.log('📋 Checking document URLs...');
    console.log('');
    
    const documents = await Document.find({}).limit(10);
    
    if (documents.length === 0) {
      console.log('No documents found in database');
      process.exit(0);
    }
    
    documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title}`);
      console.log(`   URL: ${doc.file.url}`);
      console.log(`   PublicId: ${doc.file.publicId}`);
      
      let urlType = 'Unknown';
      if (doc.file.url.startsWith('/uploads/')) {
        urlType = 'Local File';
      } else if (doc.file.url.startsWith('https://res.cloudinary.com/')) {
        urlType = 'Cloudinary URL';
      } else if (doc.file.url.startsWith('https://')) {
        urlType = 'External URL';
      }
      
      console.log(`   Type: ${urlType}`);
      console.log(`   Size: ${Math.round(doc.file.size / 1024)}KB`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkDocuments();