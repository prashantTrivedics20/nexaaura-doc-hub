# 🚀 Razorpay Real Payment Setup - ₹1 Testing

## 🎯 Current Status
- **Price**: ₹1 (for testing real payments)
- **Mode**: Ready for real Razorpay integration
- **Test Mode**: Disabled (requires real credentials)

## 📋 Step-by-Step Setup

### Step 1: Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up with your business email
3. **Important**: Use your real business details for KYC

### Step 2: Complete KYC (Required for Live Payments)
1. Upload required documents:
   - **PAN Card** (mandatory)
   - **Bank Account Proof** (cancelled cheque/bank statement)
   - **Business Registration** (if applicable)
   - **Address Proof**
2. Wait for verification (usually 24-48 hours)

### Step 3: Add Bank Account
1. Go to **Settings** → **Bank Accounts**
2. Add your bank account details:
   - Account Holder Name: `[Your Name]`
   - Account Number: `[Your Account Number]`
   - IFSC Code: `[Your Bank IFSC]`
   - Bank Name: `[Your Bank]`
3. Upload cancelled cheque or bank statement
4. Wait for verification

### Step 4: Get API Keys
1. Go to **Settings** → **API Keys**
2. Generate **Test Keys** first:
   ```
   Key ID: rzp_test_xxxxxxxxxx
   Key Secret: xxxxxxxxxxxxxxxxxx
   ```
3. After KYC approval, generate **Live Keys**:
   ```
   Key ID: rzp_live_xxxxxxxxxx  
   Key Secret: xxxxxxxxxxxxxxxxxx
   ```

### Step 5: Update Environment Variables
Edit `backend/.env` file:

```env
# For Testing (Test Keys)
RAZORPAY_KEY_ID=rzp_test_your_actual_test_key_id
RAZORPAY_KEY_SECRET=your_actual_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# For Production (Live Keys - after KYC approval)
# RAZORPAY_KEY_ID=rzp_live_your_actual_live_key_id
# RAZORPAY_KEY_SECRET=your_actual_live_key_secret
```

### Step 6: Setup Webhook (Optional)
1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret and add to `.env`

### Step 7: Restart Backend
```bash
cd backend
npm run dev
```

## 🧪 Testing with Real Payments

### Test Cards (Test Mode Only)
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name
```

### Test UPI (Test Mode Only)
```
UPI ID: success@razorpay (for success)
UPI ID: failure@razorpay (for failure)
```

### Real Payment Testing
1. Use **Test Keys** first
2. Test with small amounts (₹1)
3. Verify money doesn't actually get deducted
4. Check Razorpay dashboard for test transactions

## 💰 Payment Flow (₹1)

### User Experience:
1. User clicks "Get Lifetime Access - ₹1"
2. Razorpay checkout opens with ₹1 amount
3. User can pay via:
   - **UPI**: Google Pay, PhonePe, Paytm, etc.
   - **QR Code**: Scan with any UPI app
   - **Cards**: Credit/Debit cards
   - **Net Banking**: All major banks
   - **Wallets**: Paytm, PhonePe, etc.
4. Payment success → User gets lifetime premium access
5. Payment failure → User can retry

### Backend Processing:
1. Creates Razorpay order for ₹1
2. Verifies payment signature
3. Updates user to premium status
4. Sets premium expiry to 100 years (lifetime)

## 🔄 Switching to ₹100 Later

When ready to change price back to ₹100:

1. **Update Backend** (`backend/routes/payments.js`):
```javascript
const PLANS = {
  lifetime: {
    amount: 10000, // ₹100 in paise
    currency: 'INR',
    duration: 36500,
  },
};
```

2. **Update Frontend** (`frontend-new/src/pages/Premium.jsx`):
```javascript
price: 100,
originalPrice: 2999,
savings: '₹2,899 saved',
```

3. **Update UI Text**:
- Change "₹1" to "₹100" in all places
- Update savings calculations
- Update promotional text

## 📊 Transaction Fees

### Razorpay Charges:
- **Domestic Cards**: 2% + GST
- **UPI**: 2% + GST  
- **Net Banking**: 2% + GST
- **Wallets**: 2% + GST

### For ₹1 Transaction:
- **Amount**: ₹1.00
- **Razorpay Fee**: ₹0.02 + GST
- **You Receive**: ~₹0.97

### For ₹100 Transaction:
- **Amount**: ₹100.00
- **Razorpay Fee**: ₹2.00 + GST  
- **You Receive**: ~₹97.64

## 🚨 Important Notes

### Security:
- ✅ Never commit real API keys to Git
- ✅ Use environment variables only
- ✅ Keep webhook secret secure
- ✅ Use HTTPS in production

### Testing:
- ✅ Always test with Test Keys first
- ✅ Verify webhook integration
- ✅ Test all payment methods
- ✅ Check failure scenarios

### Go Live Checklist:
- [ ] KYC completed and approved
- [ ] Bank account verified
- [ ] Test payments working
- [ ] Webhook configured
- [ ] Live keys generated
- [ ] Environment updated with live keys
- [ ] SSL certificate installed
- [ ] Domain configured

## 🎯 Current Test Setup

**Ready to test with real Razorpay integration at ₹1!**

1. Get your Razorpay Test Keys
2. Update `.env` file with real keys
3. Restart backend
4. Test payment flow
5. Verify ₹1 transactions work
6. Switch to Live Keys when ready
7. Change price to ₹100 when confident

---

**Status**: 🔧 **READY FOR RAZORPAY INTEGRATION** - Add your keys to start testing!