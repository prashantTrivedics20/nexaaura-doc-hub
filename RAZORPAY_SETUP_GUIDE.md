# Razorpay Payment Gateway Setup Guide

## Overview
This guide will help you set up Razorpay payment gateway to accept payments via UPI, QR Code, Cards, Net Banking, and Wallets.

## Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up with your business email
3. Complete KYC verification with your bank details and business documents
4. Once verified, you can start accepting payments

## Step 2: Get API Keys

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Click on **Generate Test Keys** (for testing) or **Generate Live Keys** (for production)
4. You'll get:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (keep this secret!)

## Step 3: Configure Backend

1. Open `backend/.env` file
2. Add your Razorpay credentials:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 4: Setup Webhook (Optional but Recommended)

Webhooks notify your server about payment events automatically.

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Click **Add New Webhook**
3. Enter your webhook URL: `https://your-domain.com/api/payments/webhook`
4. Select events to listen:
   - `payment.captured`
   - `payment.failed`
5. Copy the **Webhook Secret** and add it to your `.env` file

## Step 5: Bank Account Setup

To receive payments in your bank account:

1. Go to **Settings** → **Bank Accounts**
2. Click **Add Bank Account**
3. Enter your bank details:
   - Account Holder Name
   - Account Number
   - IFSC Code
   - Bank Name
4. Upload required documents:
   - Cancelled Cheque or Bank Statement
   - PAN Card
   - Business Registration (if applicable)
5. Wait for verification (usually 24-48 hours)

## Step 6: Test Payment Flow

### Test Mode
Use these test credentials to test payments:

**Test Cards:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI:**
- UPI ID: `success@razorpay`
- For failed payment: `failure@razorpay`

### Testing Steps:
1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend-new && npm run dev`
3. Go to Premium page
4. Click "Get Started" on any plan
5. Click "Proceed to Pay"
6. Razorpay checkout will open with all payment options:
   - **UPI**: Enter test UPI ID or scan QR code
   - **Cards**: Use test card details
   - **Net Banking**: Select any bank
   - **Wallets**: Select any wallet

## Step 7: Go Live

Once testing is complete:

1. Complete KYC verification in Razorpay Dashboard
2. Add your bank account and wait for verification
3. Generate **Live API Keys** from Dashboard
4. Update `.env` with live keys:
```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
```
5. Deploy your application
6. Update webhook URL to production URL

## Payment Options Available

Your users can pay using:

1. **UPI** 
   - Google Pay
   - PhonePe
   - Paytm
   - BHIM
   - Any UPI app

2. **QR Code**
   - Scan and pay with any UPI app

3. **Cards**
   - Credit Cards (Visa, Mastercard, Amex, RuPay)
   - Debit Cards (All major banks)

4. **Net Banking**
   - All major banks in India

5. **Wallets**
   - Paytm
   - PhonePe
   - Mobikwik
   - Freecharge
   - And more

## Pricing Plans

Current plan configured:

- **Lifetime Premium Access**: ₹1 (One-time payment for lifetime access) - **TESTING PRICE**

**Note**: Price is set to ₹1 for testing real payments. Change to ₹100 for production.

To change pricing, edit `backend/routes/payments.js`:

```javascript
const PLANS = {
  lifetime: {
    amount: 100, // Amount in paise (₹1 for testing, change to 10000 for ₹100)
    currency: 'INR',
    duration: 36500, // days (100 years = lifetime)
  },
};
```

## Transaction Fees

Razorpay charges:
- **2% + GST** on domestic transactions
- No setup fees
- No annual maintenance fees

## Settlement

- Payments are settled to your bank account within **T+2 to T+7 days**
- You can view settlement reports in Dashboard
- Instant settlements available (additional charges apply)

## Security Features

✅ PCI DSS Level 1 Compliant
✅ 256-bit SSL Encryption
✅ 3D Secure Authentication
✅ Fraud Detection
✅ Automatic Refunds Support

## Support

- **Razorpay Support**: support@razorpay.com
- **Documentation**: https://razorpay.com/docs/
- **Dashboard**: https://dashboard.razorpay.com/

## Important Notes

1. **Test Mode**: Always test thoroughly before going live
2. **Webhook Secret**: Keep it secure, never commit to Git
3. **Refund Policy**: Configure your refund policy in Dashboard
4. **GST**: Razorpay automatically handles GST on transactions
5. **Compliance**: Ensure your business is compliant with RBI guidelines

## Troubleshooting

### Payment Failed
- Check if API keys are correct
- Verify webhook URL is accessible
- Check server logs for errors

### Webhook Not Working
- Verify webhook URL is publicly accessible
- Check webhook secret is correct
- Ensure your server can receive POST requests

### Settlement Delayed
- Verify bank account is verified
- Check if KYC is complete
- Contact Razorpay support

## Next Steps

1. ✅ Install Razorpay package (Already done)
2. ✅ Create payment routes (Already done)
3. ✅ Integrate frontend (Already done)
4. ⏳ Get Razorpay API keys
5. ⏳ Add keys to `.env` file
6. ⏳ Test payment flow
7. ⏳ Complete KYC verification
8. ⏳ Add bank account
9. ⏳ Go live!

---

**Need Help?** Contact Razorpay support or check their comprehensive documentation.
