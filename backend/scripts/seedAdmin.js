#!/usr/bin/env node

/**
 * Admin User Seeding Script
 * Creates the initial admin user for the Nexaura Document Hub
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const { connectDB } = require('../config/database');

// Admin credentials
const ADMIN_CREDENTIALS = {
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
};

const createAdminUser = async () => {
  try {
    console.log('🚀 Starting Admin User Creation...');
    console.log('=' * 50);

    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: ADMIN_CREDENTIALS.email },
        { username: ADMIN_CREDENTIALS.username },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Ask if user wants to update existing admin
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        rl.question('Do you want to update the existing admin user? (y/N): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Admin creation cancelled');
        process.exit(0);
      }

      // Update existing admin
      existingAdmin.username = ADMIN_CREDENTIALS.username;
      existingAdmin.email = ADMIN_CREDENTIALS.email;
      existingAdmin.password = ADMIN_CREDENTIALS.password; // Will be hashed by pre-save hook
      existingAdmin.role = 'admin';
      existingAdmin.profile = ADMIN_CREDENTIALS.profile;
      existingAdmin.isEmailVerified = true;
      existingAdmin.emailVerifiedAt = new Date();
      existingAdmin.isPremium = true;
      existingAdmin.isActive = true;

      await existingAdmin.save();
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin user
      const adminUser = new User(ADMIN_CREDENTIALS);
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }

    // Verify admin user
    const admin = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    
    console.log('\n📋 Admin User Details:');
    console.log('=' * 30);
    console.log(`👤 Username: ${admin.username}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`✅ Email Verified: ${admin.isEmailVerified}`);
    console.log(`⭐ Premium: ${admin.isPremium}`);
    console.log(`🟢 Active: ${admin.isActive}`);
    console.log(`📅 Created: ${admin.createdAt}`);

    console.log('\n🔐 Login Credentials:');
    console.log('=' * 25);
    console.log(`Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`Password: ${ADMIN_CREDENTIALS.password}`);

    console.log('\n🌐 Admin Panel Access:');
    console.log('=' * 25);
    console.log('Local: http://localhost:3000/signin');
    console.log('Production: https://your-domain.com/signin');
    console.log('\nAfter login, navigate to /app/admin for admin panel');

    console.log('\n🎉 Admin setup completed successfully!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 11000) {
      console.error('💡 Duplicate key error - user with this email/username already exists');
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Process interrupted');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Process terminated');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser, ADMIN_CREDENTIALS };