const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Pricing plans
const PLANS = {
  lifetime: {
    amount: 100, // ₹1 in paise (for testing)
    currency: 'INR',
    duration: 36500, // 100 years (lifetime)
  },
};

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { planType } = req.body;

    if (!planType || !PLANS[planType]) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const plan = PLANS[planType];
    const receipt = `receipt_${Date.now()}`;

    // Check if we have valid Razorpay credentials
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || 
        process.env.RAZORPAY_KEY_ID.includes('your_') || 
        process.env.RAZORPAY_KEY_ID === 'rzp_test_1234567890') {
      
      return res.status(500).json({ 
        message: 'Payment system not configured. Please add valid Razorpay credentials to environment variables.',
        error: 'RAZORPAY_NOT_CONFIGURED'
      });
    }

    const options = {
      amount: plan.amount,
      currency: plan.currency,
      receipt: receipt,
      notes: {
        userId: req.user._id.toString(),
        planType: planType,
        email: req.user.email,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      user: req.user._id,
      razorpayOrderId: order.id,
      amount: plan.amount,
      currency: plan.currency,
      planType: planType,
      receipt: receipt,
      status: 'created',
      notes: options.notes,
    });

    await payment.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'success';
    await payment.save();

    // Update user to premium
    const user = await User.findById(payment.user);
    const plan = PLANS[payment.planType];
    
    user.isPremium = true;
    user.premiumExpiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      message: 'Payment verified successfully',
      isPremium: true,
      premiumExpiresAt: user.premiumExpiresAt,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhooks
// @access  Public (but verified)
router.post('/webhook', async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    if (event === 'payment.captured') {
      // Payment successful
      const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
      
      if (payment && payment.status !== 'success') {
        payment.razorpayPaymentId = paymentEntity.id;
        payment.status = 'success';
        await payment.save();

        // Update user to premium
        const user = await User.findById(payment.user);
        const plan = PLANS[payment.planType];
        
        user.isPremium = true;
        user.premiumExpiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
        await user.save();
      }
    } else if (event === 'payment.failed') {
      // Payment failed
      const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
      
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// @route   GET /api/payments/history
// @desc    Get user payment history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-razorpaySignature -notes');

    res.json(payments);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
});

// @route   GET /api/payments/plans
// @desc    Get available pricing plans
// @access  Public
router.get('/plans', (req, res) => {
  const plans = {
    lifetime: {
      name: 'Lifetime Premium Access',
      amount: PLANS.lifetime.amount / 100, // Convert to rupees
      currency: 'INR',
      duration: 'Lifetime',
      features: [
        'Access to all premium documents',
        'Unlimited downloads',
        'Priority support',
        'Ad-free experience',
        'Lifetime access - Pay once, use forever',
        'All future content included',
      ],
    },
  };

  res.json(plans);
});

module.exports = router;
