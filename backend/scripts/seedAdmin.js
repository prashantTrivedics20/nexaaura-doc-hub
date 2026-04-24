const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@nexa.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@nexa.com',
      password: 'admin123456', // Change this password after first login!
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      },
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('━'.repeat(60));
    console.log('📧 Email:', 'admin@nexa.com');
    console.log('👤 Username:', 'admin');
    console.log('🔑 Password:', 'admin123456');
    console.log('👑 Role:', 'admin');
    console.log('━'.repeat(60));
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');
    console.log('To login:');
    console.log('1. Go to http://localhost:3000');
    console.log('2. Click "Sign In"');
    console.log('3. Enter email: admin@nexa.com');
    console.log('4. You will receive an OTP (check backend console)');
    console.log('5. Enter the OTP to login');
    console.log('\nAfter login, you can access:');
    console.log('• Admin Dashboard: /admin');
    console.log('• Document Management: /admin/documents');
    console.log('• User Management: /admin/users');
    console.log('• Analytics: /admin/analytics');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
