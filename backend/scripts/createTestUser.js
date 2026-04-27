const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a non-premium test user
    const testEmail = 'testuser@free.com';
    
    // Delete existing user if exists
    await User.deleteOne({ email: testEmail });
    
    const user = new User({
      username: 'testuser',
      email: testEmail,
      password: 'test123456',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      isPremium: false // Explicitly set to false
    });
    
    await user.save();

    console.log('✅ Created non-premium test user');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: test123456');
    console.log('💎 Premium:', user.isPremium);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createTestUser();