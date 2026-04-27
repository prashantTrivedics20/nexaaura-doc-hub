# Admin Dashboard Rate Limit Fix

## Issues Fixed

### 1. ✅ 429 Too Many Requests Error
**Problem:** Admin dashboard was making multiple API calls simultaneously and hitting the rate limit (100 requests per 15 minutes).

**Solution:** Increased the general API rate limit from 100 to 500 requests per 15 minutes in `backend/middleware/security.js`.

**Changed:**
```javascript
// Before
general: createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later'
),

// After
general: createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  500, // 500 requests per window (increased for admin dashboard)
  'Too many requests from this IP, please try again later'
),
```

### 2. ✅ Navigation Links Fixed
**Problem:** Quick Actions and "View All" buttons were redirecting to landing page.

**Solution:** Fixed navigation paths to include `/app` prefix in `AdminDashboard.jsx`.

**Changed:**
- `/admin/documents` → `/app/admin/documents`
- `/admin/users` → `/app/admin/users`
- `/admin/analytics` → `/app/admin/analytics`
- `/admin/settings` → `/app/admin/settings`

## How to Apply the Fix

### Option 1: Restart Backend Server
```bash
cd backend
# Stop the current server (Ctrl+C)
npm start
```

### Option 2: Use the restart script
```bash
cd backend
./restart-server.bat
```

## Testing

After restarting the backend:

1. ✅ Navigate to Admin Dashboard
2. ✅ Click on Quick Actions buttons (Upload Document, Manage Users, View Analytics, Settings)
3. ✅ Click on "View All" buttons in Recent Documents and Recent Users sections
4. ✅ Verify no 429 errors in browser console
5. ✅ Verify navigation works correctly

## Rate Limit Configuration

Current rate limits:
- **General API:** 500 requests per 15 minutes
- **Authentication:** 5 attempts per 15 minutes
- **OTP:** 3 requests per 5 minutes
- **File Upload:** 10 uploads per hour
- **Password Reset:** 3 attempts per hour

## Notes

- The DOM nesting warning (`<p> cannot contain <div>`) is a React warning that doesn't affect functionality
- It's coming from MUI's internal components and can be safely ignored
- The main issue was the rate limiting blocking API requests
