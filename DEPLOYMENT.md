# Nexaura Developer Hub Deployment Guide

Complete guide for deploying Nexaura Developer Hub to production.

**Company:** [Nexaura IT Solutions](https://www.nexaurait.online/)  
**LinkedIn:** [Nexaura Company Page](https://www.linkedin.com/company/114344571/)  

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Cloudinary account set up
- [ ] Gmail App Password generated
- [ ] Backend tested locally
- [ ] Frontend tested locally
- [ ] All environment variables documented

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Backend for Production

1. **Update package.json** (already configured):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

2. **Create `.env.production`** in backend folder:
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_production_uri
JWT_SECRET=your_super_secure_jwt_secret_for_production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
PORT=5001
FRONTEND_URL=https://your-frontend-domain.vercel.app
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
MAX_FILE_SIZE=52428800
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
OTP_RATE_LIMIT_MAX=5
```

### Step 2: Deploy to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `nexaura-dev-hub-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` or `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   Add all variables from `.env.production`:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   EMAIL_USER=...
   EMAIL_PASSWORD=...
   PORT=5001
   FRONTEND_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=https://your-app.vercel.app
   MAX_FILE_SIZE=52428800
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://nexaura-dev-hub-backend.onrender.com`

### Step 3: Configure MongoDB Atlas for Production

1. **Whitelist Render IPs**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (allow from anywhere) OR
   - Add specific Render IP ranges

2. **Test Connection**
   - Check Render logs for successful MongoDB connection
   - Look for: "MongoDB connected successfully"

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update `.env.production`** in frontend-new folder:
```env
VITE_API_URL=https://nexaura-dev-hub-backend.onrender.com
```

2. **Test Production Build Locally**:
```bash
cd frontend-new
npm run build
npm run preview
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd frontend-new
vercel
```

4. **Follow Prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `nexa-dochub`
   - Directory? `./` (current directory)
   - Override settings? `N`

5. **Set Environment Variables**:
```bash
vercel env add VITE_API_URL production
# Enter: https://nexa-dochub-backend.onrender.com
```

6. **Deploy to Production**:
```bash
vercel --prod
```

#### Option B: Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-new`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL = https://nexa-dochub-backend.onrender.com
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-5 minutes)
   - Note your frontend URL: `https://nexa-dochub.vercel.app`

### Step 3: Update Backend CORS

1. **Update Backend Environment Variables on Render**
   - Go to Render Dashboard → Your Service
   - Environment → Edit
   - Update:
     ```
     FRONTEND_URL=https://nexa-dochub.vercel.app
     ALLOWED_ORIGINS=https://nexa-dochub.vercel.app
     ```
   - Save changes (will trigger redeploy)

## 🔒 Post-Deployment Security

### 1. Update MongoDB Security

```env
# Use specific database user for production
MONGODB_URI=mongodb+srv://prod_user:secure_password@cluster.mongodb.net/nexaura-dev-hub-prod
```

### 2. Secure JWT Secret

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Configure Rate Limiting

Update backend `.env` for production:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per 15 min
AUTH_RATE_LIMIT_MAX=10       # 10 auth attempts per 15 min
OTP_RATE_LIMIT_MAX=5         # 5 OTP requests per 15 min
```

### 4. Enable HTTPS Only

Backend is automatically HTTPS on Render.
Frontend is automatically HTTPS on Vercel.

## 📊 Monitoring & Logs

### Render Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor for errors

### Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment → "View Function Logs"

## 🧪 Testing Production Deployment

### Backend Health Check

```bash
curl https://nexa-dochub-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend Access

1. Open: `https://nexa-dochub.vercel.app`
2. Test sign-up flow
3. Test OTP email delivery
4. Test document upload (admin)
5. Test document download

## 🔄 Continuous Deployment

### Automatic Deployments

Both Render and Vercel support automatic deployments:

1. **Push to GitHub**:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

2. **Automatic Deployment**:
   - Render: Automatically deploys backend
   - Vercel: Automatically deploys frontend

### Manual Deployment

**Render**:
- Go to Dashboard → Service → "Manual Deploy" → "Deploy latest commit"

**Vercel**:
```bash
cd frontend-new
vercel --prod
```

## 🐛 Troubleshooting Production Issues

### Backend Not Starting

1. **Check Render Logs**:
   - Look for MongoDB connection errors
   - Verify environment variables
   - Check for missing dependencies

2. **Common Issues**:
   - MongoDB IP not whitelisted
   - Invalid MongoDB URI
   - Missing environment variables

### Frontend API Errors

1. **Check CORS Configuration**:
   - Verify ALLOWED_ORIGINS includes Vercel URL
   - Check FRONTEND_URL is correct

2. **Check API URL**:
   - Verify VITE_API_URL in Vercel environment variables
   - Test backend URL directly

### Email OTP Not Working

1. **Verify Gmail Settings**:
   - App Password is correct
   - 2FA is enabled
   - Less secure apps is NOT needed (use App Password)

2. **Check Backend Logs**:
   - Look for email sending errors
   - Verify EMAIL_USER and EMAIL_PASSWORD

### File Upload Fails

1. **Check Cloudinary Credentials**:
   - Verify all three credentials are correct
   - Test Cloudinary connection

2. **Check File Size**:
   - Verify MAX_FILE_SIZE is set correctly
   - Check Render instance has enough memory

## 📈 Performance Optimization

### Backend Optimization

1. **Enable Compression**:
   Already configured in `backend/middleware/security.js`

2. **Database Indexing**:
   Indexes are already set in models

3. **Caching**:
   Consider adding Redis for session caching

### Frontend Optimization

1. **Code Splitting**:
   Already handled by Vite

2. **Image Optimization**:
   Cloudinary automatically optimizes images

3. **CDN**:
   Vercel automatically uses CDN

## 💰 Cost Estimation

### Free Tier (Development/Testing)

- **Render**: Free tier (sleeps after 15 min inactivity)
- **Vercel**: Free tier (100GB bandwidth/month)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Cloudinary**: Free tier (25GB storage, 25GB bandwidth)

**Total**: $0/month

### Paid Tier (Production)

- **Render Starter**: $7/month (always on, 512MB RAM)
- **Vercel Pro**: $20/month (unlimited bandwidth)
- **MongoDB Atlas M10**: $57/month (2GB RAM, 10GB storage)
- **Cloudinary Plus**: $99/month (100GB storage, 100GB bandwidth)

**Total**: ~$183/month

### Recommended for Small Production

- **Render Starter**: $7/month
- **Vercel Free**: $0/month (sufficient for small apps)
- **MongoDB Atlas M0**: $0/month (free tier)
- **Cloudinary Free**: $0/month (sufficient for small apps)

**Total**: $7/month

## 🎉 Deployment Complete!

Your NEXA-DOC-HUB is now live in production!

### Next Steps:

1. ✅ Test all features in production
2. ✅ Create admin account
3. ✅ Upload test documents
4. ✅ Monitor logs for errors
5. ✅ Set up monitoring alerts
6. ✅ Configure backup strategy
7. ✅ Document custom domain setup (if needed)

### Production URLs:

- **Frontend**: https://nexa-dochub.vercel.app
- **Backend**: https://nexa-dochub-backend.onrender.com
- **MongoDB**: MongoDB Atlas Dashboard
- **Cloudinary**: Cloudinary Console

**Congratulations! 🚀**
