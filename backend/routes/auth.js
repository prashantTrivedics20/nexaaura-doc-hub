const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../config/email');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Send OTP for email verification
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
  body('purpose').isIn(['registration', 'login', 'password_reset'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, purpose } = req.body;

    // Check if user exists for login/password reset
    if (purpose === 'login' || purpose === 'password_reset') {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ message: 'No account found with this email address' });
      }
    }

    // Check if user already exists for registration
    if (purpose === 'registration') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
    }

    // Delete any existing unused OTPs for this email and purpose
    await EmailVerification.deleteMany({ 
      email, 
      purpose, 
      isUsed: false 
    });

    // Generate new OTP
    const otp = EmailVerification.generateOTP();
    
    console.log('\n' + '🔐'.repeat(30));
    console.log('🔑 OTP GENERATED FOR:', email);
    console.log('🔑 OTP CODE:', otp);
    console.log('🔑 PURPOSE:', purpose);
    console.log('🔐'.repeat(30) + '\n');
    
    // Create verification record
    const verification = new EmailVerification({
      email,
      otp,
      purpose,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await verification.save();

    // Send OTP email
    try {
      await sendEmail(email, 'otpVerification', { otp, purpose });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // In development, we'll still return success but log the error
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ message: 'Failed to send verification email' });
      }
    }

    res.json({ 
      message: 'Verification code sent successfully',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email for security
      expiresIn: 600 // 10 minutes
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('purpose').isIn(['registration', 'login', 'password_reset']),
  // Additional fields for registration
  body('username').optional().isLength({ min: 3 }).trim().escape(),
  body('password').optional().isLength({ min: 6 }),
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, purpose, username, password, firstName, lastName } = req.body;

    // Find the verification record
    const verification = await EmailVerification.findOne({
      email,
      purpose,
      isUsed: false
    }).sort({ createdAt: -1 });

    if (!verification) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    // Verify the OTP
    try {
      await verification.verifyOTP(otp);
    } catch (otpError) {
      return res.status(400).json({ message: otpError.message });
    }

    let user;
    let token;

    if (purpose === 'registration') {
      // Validate required fields for registration
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required for registration' });
      }

      // Check if username is already taken
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }

      // Create new user
      user = new User({
        username,
        email,
        password,
        profile: {
          firstName: firstName || '',
          lastName: lastName || ''
        },
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      });

      await user.save();

      // Send welcome email
      try {
        await sendEmail(email, 'welcomeEmail', { username });
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't fail the registration if welcome email fails
      }

      token = generateToken(user._id);

      res.status(201).json({
        message: 'Registration completed successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isEmailVerified: user.isEmailVerified,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt
        }
      });

    } else if (purpose === 'login') {
      // Find user and complete login
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Update last login
      user.lastLogin = new Date();
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
      }
      await user.save();

      token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          lastLogin: user.lastLogin,
          isEmailVerified: user.isEmailVerified,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt
        }
      });

    } else if (purpose === 'password_reset') {
      // Return a temporary token for password reset
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = jwt.sign(
        { userId: user._id, purpose: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({
        message: 'Email verified successfully',
        resetToken,
        userId: user._id
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Reset password with verified token
router.post('/reset-password', [
  body('resetToken').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resetToken, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if premium has expired
    if (user.isPremium && user.premiumExpiresAt && new Date() > user.premiumExpiresAt) {
      user.isPremium = false;
      await user.save();
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (phone !== undefined) user.profile.phone = phone;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Failed to refresh token' });
  }
});

module.exports = router;