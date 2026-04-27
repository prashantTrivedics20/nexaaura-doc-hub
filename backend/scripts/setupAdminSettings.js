const mongoose = require('mongoose');
const AdminSettings = require('../models/AdminSettings');
require('dotenv').config();

const setupAdminSettings = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Default settings to create
    const defaultSettings = [
      {
        key: 'free_document_access',
        value: false,
        description: 'Allow all authenticated users to view and download documents without premium subscription'
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Put the system in maintenance mode (only admins can access)'
      },
      {
        key: 'registration_enabled',
        value: true,
        description: 'Allow new users to register accounts'
      },
      {
        key: 'payment_required',
        value: true,
        description: 'Require payment for premium features (when free access is disabled)'
      }
    ];

    console.log('🔧 Setting up default admin settings...');

    for (const setting of defaultSettings) {
      await AdminSettings.setSetting(
        setting.key,
        setting.value,
        setting.description
      );
      console.log(`✅ Set ${setting.key}: ${setting.value}`);
    }

    console.log('\n🎉 Admin settings setup completed!');
    console.log('\n📋 Current Settings:');
    
    const allSettings = await AdminSettings.find();
    allSettings.forEach(setting => {
      console.log(`  ${setting.settingKey}: ${setting.settingValue}`);
    });

    console.log('\n🚀 You can now manage these settings from the Admin Dashboard > System Settings');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin settings:', error);
    process.exit(1);
  }
};

setupAdminSettings();