const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'success', 'failed'],
    default: 'created',
  },
  planType: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime'],
    required: true,
  },
  receipt: {
    type: String,
  },
  notes: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
