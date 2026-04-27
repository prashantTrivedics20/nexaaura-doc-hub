# 🔧 PDF Viewer Fix Guide

## Issues Fixed

### 1. **Port Mismatch (403 Forbidden)**
**Problem**: Frontend trying to access port 5002, backend running on 5001
**Solution**: Updated `frontend-new/.env` to use correct port

```env
# Before
VITE_API_URL=http://localhost:5002

# After  
VITE_API_URL=http://localhost:5001
```

### 2. **MUI Theme Elevation Error**
**Problem**: Theme missing elevation 24 definition
**Solution**: Extended theme shadows array to support higher elevations

### 3. **Premium Access Check**
**Problem**: Proxy endpoint requiring premium access even with free access enabled
**Solution**: Updated proxy endpoint to check admin settings for free access

## Quick Fixes

### Step 1: Restart Frontend
After changing the `.env` file, restart the frontend:
```bash
cd frontend-new
npm run dev
```

### Step 2: Enable Free Access (For Testing)
```bash
cd backend
npm run enable:free-access
```

### Step 3: Verify Backend Port
Make sure your backend is running on port 5001:
```bash
cd backend
npm run dev
# Should show: Server running on port 5001
```

## Testing the Fix

1. **Login** with admin credentials:
   - Email: `nexaaurait@gmail.com`
   - Password: `trivedi_cs1`

2. **Upload a test PDF** through admin panel

3. **Try viewing the PDF** from dashboard

4. **Check browser console** for any remaining errors

## Common Issues & Solutions

### Issue: Still getting 403 Forbidden
**Solution**: 
```bash
# Enable free access
cd backend
npm run enable:free-access

# Or check admin settings in the admin panel
# Go to /app/admin/settings and enable "Free Document Access"
```

### Issue: PDF still not loading
**Possible causes**:
1. **Cloudinary file is private** - Re-upload the document
2. **Invalid JWT token** - Logout and login again
3. **CORS issues** - Check browser network tab

### Issue: MUI elevation warnings
**Solution**: The theme has been updated to support elevations up to 24

## Admin Panel Settings

You can also control document access through the admin panel:

1. Go to `/app/admin/settings`
2. Find "Free Document Access" setting
3. Toggle it on/off as needed

## Environment Variables Check

Make sure your environment variables are correct:

**Backend (.env)**:
```env
MONGODB_URI=mongodb://localhost:27017/nexaura-docs
JWT_SECRET=your-jwt-secret
# ... other variables
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:5001
```

## Testing Commands

```bash
# Test if backend is accessible
curl http://localhost:5001/health

# Test if document proxy works (replace with actual document ID and token)
curl "http://localhost:5001/api/documents/DOCUMENT_ID/proxy?token=YOUR_JWT_TOKEN"

# Enable free access for testing
cd backend && npm run enable:free-access

# Disable free access (require premium)
cd backend && npm run disable:free-access
```

## Success Indicators

✅ **Frontend connects to backend** (no 403 errors)  
✅ **PDF loads in viewer** (no "PDF loading failed")  
✅ **No MUI theme warnings** in console  
✅ **Document download works**  
✅ **Admin panel accessible**  

## Still Having Issues?

1. **Check browser console** for specific error messages
2. **Check backend logs** for server-side errors  
3. **Verify database connection** is working
4. **Test with a fresh PDF upload**
5. **Clear browser cache** and try again

---

**The PDF viewer should now work correctly! 🎉**