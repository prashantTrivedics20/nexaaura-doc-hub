#!/usr/bin/env node

/**
 * Disable Free Access Script
 * Disables free document access (requires premium)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const AdminSettings = require('../models/AdminSettings');
const { connectDB } = require('../config/database');

const disableFreeAccess = async () => {
  try {
    console.log('🔒 Disabling free document access...');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Find and update the free access setting
    let setting = await AdminSettings.findOne({ key: 'free_document_access' });
    
    if (setting) {
      setting.value = false;
      await setting.save();
      console.log('✅ Updated free access setting to: false');
    } else {
      setting = new AdminSettings({
        key: 'free_document_access',
        value: false,
        description: 'Allow all authenticated users to view and download documents without premium subscription',
        category: 'Access Control'
      });
      await setting.save();
      console.log('✅ Created new free access setting: false');
    }

    console.log('\n🔒 Free document access is now DISABLED!');
    console.log('💳 Users will need premium subscription to view and download documents.');
    console.log('\n💡 To enable free access again, use the admin panel or run:');
    console.log('   node scripts/enableFreeAccess.js');

  } catch (error) {
    console.error('❌ Error disabling free access:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
disableFreeAccess();