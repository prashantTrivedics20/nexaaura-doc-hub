#!/usr/bin/env node

/**
 * Enable Free Access Script
 * Enables free document access for testing purposes
 */

const mongoose = require('mongoose');
require('dotenv').config();

const AdminSettings = require('../models/AdminSettings');
const { connectDB } = require('../config/database');

const enableFreeAccess = async () => {
  try {
    console.log('🔓 Enabling free document access...');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Find or create the free access setting
    let setting = await AdminSettings.findOne({ key: 'free_document_access' });
    
    if (setting) {
      setting.value = true;
      await setting.save();
      console.log('✅ Updated existing free access setting to: true');
    } else {
      setting = new AdminSettings({
        key: 'free_document_access',
        value: true,
        description: 'Allow all authenticated users to view and download documents without premium subscription',
        category: 'Access Control'
      });
      await setting.save();
      console.log('✅ Created new free access setting: true');
    }

    console.log('\n🎉 Free document access is now ENABLED!');
    console.log('📝 All authenticated users can now view and download documents without premium subscription.');
    console.log('\n💡 To disable free access later, use the admin panel or run:');
    console.log('   node scripts/disableFreeAccess.js');

  } catch (error) {
    console.error('❌ Error enabling free access:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
enableFreeAccess();