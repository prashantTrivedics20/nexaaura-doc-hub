# Payment Integration Test Guide

## Current Status
✅ Backend payment routes are working
✅ Frontend payment integration is complete
✅ Test mode is enabled (no real Razorpay credentials needed)

## How to Test Payment Flow

### Step 1: Access the Premium Page
1. Open your browser and go to: `http://localhost:3001/app/premium`
2. Make sure you're logged in (if not, go to sign in first)

### Step 2: Test Payment Flow
1. Click on "🚀 Get Lifetime Access - ₹100" button
2. A confirmation dialog will appear
3. Click "Proceed to Pay"
4. You'll see a warning message about test mode
5. After 2 seconds, the system will simulate a successful payment
6. You'll get premium access automatically

### Step 3: Verify Premium Access
1. Check that you get redirected to the dashboard
2. Verify that you can now view and download documents
3. Check that the premium banner is no longer shown

## Test Mode Features

Currently running in **TEST MODE** because:
- No real Razorpay credentials are configured
- Uses simulated payment flow
- Automatically grants premium access after 2 seconds

## To Enable Real Payments

### Step 1: Get Razorpay Account
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Complete KYC verification
3. Add your bank account details

### Step 2: Get API Keys
1. Go to Settings → API Keys
2. Generate Test Keys (for testing) or Live Keys (for production)
3. Copy the Key ID and Key Secret

### Step 3: Update Environment Variables
Edit `backend/.env` file:

```env
# Replace these test values with your real Razorpay credentials
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

## Payment Options Available

Once real credentials are added, users can pay using:

1. **UPI Apps**
   - Google Pay
   - PhonePe  
   - Paytm
   - BHIM
   - Any UPI app

2. **QR Code**
   - Scan with any UPI app

3. **Cards**
   - Credit Cards (Visa, Mastercard, Amex, RuPay)
   - Debit Cards

4. **Net Banking**
   - All major Indian banks

5. **Wallets**
   - Paytm Wallet
   - PhonePe Wallet
   - Mobikwik
   - Freecharge

## Current Pricing

- **Lifetime Premium Access**: ₹100 (One-time payment)
- **Features**: Access to all documents, unlimited downloads, priority support
- **Duration**: Lifetime (100 years in system)

## Troubleshooting

### "Failed to create order" Error
- ✅ **FIXED**: Backend is now running properly
- ✅ **FIXED**: Payment routes are working
- ✅ **FIXED**: Test mode handles missing credentials

### CORS Issues
- ✅ **FIXED**: CORS is properly configured
- ✅ **FIXED**: Frontend can communicate with backend

### Authentication Issues
- Make sure you're logged in before trying to pay
- Check that your session token is valid

## Next Steps

1. **Test the current flow** (works in test mode)
2. **Get Razorpay account** when ready for real payments
3. **Add real credentials** to enable actual payment processing
4. **Test with real payment methods**
5. **Deploy to production**

## Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs in terminal
3. Verify you're logged in
4. Make sure both frontend and backend are running

---

**Current Status**: Ready for testing in simulation mode! 🚀