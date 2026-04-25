const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const testPremiumUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create a test user
    const testEmail = 'test@premium.com';
    let user = await User.findOne({ email: testEmail });

    if (!user) {
      // Create test user
      user = new User({
        username: 'premiumtester',
        email: testEmail,
        password: 'test123456',
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      });
      await user.save();
      console.log('✅ Created test user');
    }

    // Make user premium
    user.isPremium = true;
    user.premiumExpiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
    await user.save();

    console.log('✅ Updated user to premium status');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: test123456');
    console.log('💎 Premium:', user.isPremium);
    console.log('📅 Expires:', user.premiumExpiresAt);

    // Verify the user can be fetched with premium status
    const fetchedUser = await User.findOne({ email: testEmail });
    console.log('✅ Verification - Premium status:', fetchedUser.isPremium);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testPremiumUser();