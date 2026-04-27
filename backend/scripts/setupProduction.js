#!/usr/bin/env node

/**
 * Production Setup Script
 * Sets up admin user, default categories, and initial settings
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const AdminSettings = require('../models/AdminSettings');
const { connectDB } = require('../config/database');

// Setup configuration
const SETUP_CONFIG = {
  admin: {
    username: 'nexaura_admin',
    email: 'nexaaurait@gmail.com',
    password: 'trivedi_cs1',
    role: 'admin',
    profile: {
      firstName: 'Nexaura',
      lastName: 'Admin',
      phone: ''
    },
    isEmailVerified: true,
    emailVerifiedAt: new Date(),
    isPremium: true,
    isActive: true
  },
  
  categories: [
    {
      name: 'policy',
      displayName: 'Policies',
      description: 'Company policies and procedures',
      color: '#8B5CF6',
      icon: 'policy',
      isActive: true
    },
    {
      name: 'procedure',
      displayName: 'Procedures',
      description: 'Step-by-step procedures and workflows',
      color: '#EC4899',
      icon: 'list_alt',
      isActive: true
    },
    {
      name: 'manual',
      displayName: 'Manuals',
      description: 'User manuals and documentation',
      color: '#10B981',
      icon: 'menu_book',
      isActive: true
    },
    {
      name: 'report',
      displayName: 'Reports',
      description: 'Reports and analytics documents',
      color: '#F59E0B',
      icon: 'assessment',
      isActive: true
    },
    {
      name: 'contract',
      displayName: 'Contracts',
      description: 'Legal contracts and agreements',
      color: '#3B82F6',
      icon: 'description',
      isActive: true
    },
    {
      name: 'training',
      displayName: 'Training Materials',
      description: 'Training documents and resources',
      color: '#6366F1',
      icon: 'school',
      isActive: true
    },
    {
      name: 'template',
      displayName: 'Templates',
      description: 'Document templates and forms',
      color: '#8B5CF6',
      icon: 'content_copy',
      isActive: true
    },
    {
      name: 'other',
      displayName: 'Other',
      description: 'Miscellaneous documents',
      color: '#6B7280',
      icon: 'folder',
      isActive: true
    }
  ],

  settings: [
    {
      key: 'free_document_access',
      value: false,
      description: 'Allow all authenticated users to view and download documents without premium subscription',
      category: 'Access Control'
    },
    {
      key: 'maintenance_mode',
      value: false,
      description: 'Put the system in maintenance mode (only admins can access)',
      category: 'System'
    },
    {
      key: 'registration_enabled',
      value: true,
      description: 'Allow new users to register accounts',
      category: 'Access Control'
    },
    {
      key: 'payment_required',
      value: true,
      description: 'Require payment for premium features (when free access is disabled)',
      category: 'Payment'
    }
  ]
};

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const setupAdmin = async () => {
  try {
    log('👤 Setting up admin user...', 'info');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: SETUP_CONFIG.admin.email },
        { username: SETUP_CONFIG.admin.username }
      ]
    });

    let admin;
    if (existingAdmin) {
      log('⚠️  Admin user already exists, updating...', 'warning');
      
      // Update existing admin
      Object.assign(existingAdmin, SETUP_CONFIG.admin);
      admin = await existingAdmin.save();
    } else {
      // Create new admin user
      admin = new User(SETUP_CONFIG.admin);
      await admin.save();
      log('✅ Admin user created successfully', 'success');
    }

    return admin;
  } catch (error) {
    log(`❌ Error setting up admin: ${error.message}`, 'error');
    throw error;
  }
};

const setupCategories = async (adminId) => {
  try {
    log('📁 Setting up default categories...', 'info');

    const createdCategories = [];

    for (const categoryData of SETUP_CONFIG.categories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({ name: categoryData.name });

      if (existingCategory) {
        log(`⚠️  Category '${categoryData.displayName}' already exists, skipping...`, 'warning');
        createdCategories.push(existingCategory);
        continue;
      }

      // Create new category
      const category = new Category({
        ...categoryData,
        createdBy: adminId
      });

      await category.save();
      createdCategories.push(category);
      log(`✅ Created category: ${categoryData.displayName}`, 'success');
    }

    return createdCategories;
  } catch (error) {
    log(`❌ Error setting up categories: ${error.message}`, 'error');
    throw error;
  }
};

const setupAdminSettings = async () => {
  try {
    log('⚙️  Setting up admin settings...', 'info');

    const createdSettings = [];

    for (const settingData of SETUP_CONFIG.settings) {
      // Check if setting already exists
      const existingSetting = await AdminSettings.findOne({ key: settingData.key });

      if (existingSetting) {
        log(`⚠️  Setting '${settingData.key}' already exists, skipping...`, 'warning');
        createdSettings.push(existingSetting);
        continue;
      }

      // Create new setting
      const setting = new AdminSettings(settingData);
      await setting.save();
      createdSettings.push(setting);
      log(`✅ Created setting: ${settingData.key}`, 'success');
    }

    return createdSettings;
  } catch (error) {
    log(`❌ Error setting up admin settings: ${error.message}`, 'error');
    throw error;
  }
};

const runSetup = async () => {
  try {
    log('🚀 Starting Production Setup...', 'info');
    log('=' * 50, 'info');

    // Connect to database
    await connectDB();
    log('✅ Connected to database', 'success');

    // Setup admin user
    const admin = await setupAdmin();

    // Setup categories
    const categories = await setupCategories(admin._id);

    // Setup admin settings
    const settings = await setupAdminSettings();

    // Display summary
    log('\n📋 Setup Summary:', 'info');
    log('=' * 30, 'info');
    log(`👤 Admin User: ${admin.email}`, 'success');
    log(`📁 Categories: ${categories.length} created/verified`, 'success');
    log(`⚙️  Settings: ${settings.length} created/verified`, 'success');

    log('\n🔐 Admin Login Credentials:', 'info');
    log('=' * 35, 'info');
    log(`Email: ${SETUP_CONFIG.admin.email}`, 'info');
    log(`Password: ${SETUP_CONFIG.admin.password}`, 'info');

    log('\n🌐 Access URLs:', 'info');
    log('=' * 20, 'info');
    log('Local Development:', 'info');
    log('  Frontend: http://localhost:3000', 'info');
    log('  Backend: http://localhost:5001', 'info');
    log('  Admin Panel: http://localhost:3000/signin → /app/admin', 'info');
    
    log('\nProduction:', 'info');
    log('  Frontend: https://your-domain.vercel.app', 'info');
    log('  Backend: https://your-api.onrender.com', 'info');
    log('  Admin Panel: https://your-domain.vercel.app/signin → /app/admin', 'info');

    log('\n🎉 Production setup completed successfully!', 'success');
    log('\n💡 Next Steps:', 'info');
    log('1. Start the backend server: npm run dev (in backend folder)', 'info');
    log('2. Start the frontend server: npm run dev (in frontend-new folder)', 'info');
    log('3. Login with admin credentials', 'info');
    log('4. Upload some test documents', 'info');
    log('5. Test all functionality before deployment', 'info');

  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    log('🔌 Database connection closed', 'info');
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  log('\n⚠️  Process interrupted', 'warning');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n⚠️  Process terminated', 'warning');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the setup
if (require.main === module) {
  runSetup();
}

module.exports = { runSetup, SETUP_CONFIG };