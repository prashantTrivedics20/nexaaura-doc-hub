# Nexaura Developer Hub - Complete Setup & Deployment Guide

## 🎯 Current Status

### ✅ Completed Features
- Authentication system with OTP verification
- Admin dashboard with full CRUD operations
- Document management (upload, edit, delete)
- User management system
- Analytics dashboard
- Premium features page
- MongoDB Atlas integration
- Cloudinary file storage

### ⚠️ Known Issues
1. **Vertical line on sidebar** - MUI Drawer default border
2. **HTML nesting warnings** - Fixed in Dashboard.jsx

## 🔧 Quick Fixes

### Fix 1: Remove Sidebar Border (CSS Override)

Add this to `frontend-new/src/index.css` at the very top:

```css
/* CRITICAL: Remove MUI Drawer border - Must be at top */
.MuiDrawer-paper,
.MuiDrawer-paperAnchorLeft,
.MuiDrawer-paperAnchorDockedLeft,
.MuiDrawer-docked .MuiDrawer-paper {
  border-right: 0 !important;
  border: 0 !important;
}
```

### Fix 2: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or: Settings → Privacy → Clear browsing data → Cached images and files

## 📦 Local Testing

### Backend Setup
```bash
cd backend
npm install
npm run seed:admin  # Creates admin user
node server.js      # Start backend on port 5001
```

### Frontend Setup
```bash
cd frontend-new
npm install
npm run dev         # Start frontend on port 3000
```

### Admin Login
- Email: `admin@nexaura.com`
- Password: Check backend console for OTP
- Access: `/app/admin`, `/app/admin/documents`, `/app/admin/users`, `/app/admin/analytics`

## 🚀 Deployment

### Backend (Render.com)

1. **Create Web Service**
   - Repository: Your GitHub repo
   - Branch: main
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`

2. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=dqjazvvp5
   CLOUDINARY_API_KEY=611928778195652
   CLOUDINARY_API_SECRET=mO-v6JoFa7NLX5F9Sxsc_l4WDXs
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   PORT=5001
   FRONTEND_URL=https://your-frontend.vercel.app
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

### Frontend (Vercel)

1. **Import Project**
   - Repository: Your GitHub repo
   - Framework: Vite
   - Root Directory: `frontend-new`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

## 🧪 Testing Checklist

- [ ] Admin can login with OTP
- [ ] Admin can upload documents
- [ ] Admin can edit/delete documents
- [ ] Admin can create/edit/delete users
- [ ] Users can browse documents
- [ ] Users can download documents
- [ ] Analytics page shows statistics
- [ ] Premium page displays correctly

## 📝 Admin Credentials

**Default Admin Account:**
- Email: admin@nexaura.com
- Username: admin
- Role: admin

**To create more admins:**
```bash
cd backend
npm run seed:admin
```

## 🐛 Troubleshooting

### Issue: OTP not showing
**Solution:** Check backend console logs. OTP is printed there in development mode.

### Issue: Network errors
**Solution:** 
1. Check backend is running on port 5001
2. Check frontend .env has correct API_URL
3. Check CORS settings in backend/.env

### Issue: Documents not uploading
**Solution:**
1. Verify Cloudinary credentials
2. Check file size (max 50MB)
3. Check backend logs for errors

### Issue: Vertical line on sidebar
**Solution:**
1. Add CSS override to index.css (see Fix 1 above)
2. Clear browser cache completely
3. Hard refresh (Ctrl+Shift+R)

## 📞 Support

For issues, check:
1. Backend console logs
2. Frontend browser console
3. Network tab in DevTools

## 🎨 Customization

### Change Theme Colors
Edit `frontend-new/src/theme/theme.js`:
```javascript
primary: {
  main: '#8B5CF6', // Change this
}
```

### Change App Name
Edit `frontend-new/.env`:
```
VITE_APP_NAME=Your App Name
```

## ✅ Production Checklist

Before deploying:
- [ ] Change admin password after first login
- [ ] Set up Gmail App Password for emails
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS only
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Test all features in production

---

**Built with:** React 19.2.5, Node.js, Express, MongoDB, Cloudinary
**License:** MIT
