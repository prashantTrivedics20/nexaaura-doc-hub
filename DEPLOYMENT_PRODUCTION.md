# 🚀 Production Deployment Guide

## Overview
This guide covers deploying the Nexaura Document Hub to production using:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexaura-docs
DB_NAME=nexaura-docs

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay (for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security
METRICS_TOKEN=your-metrics-token
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Environment
NODE_ENV=production
PORT=5000
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-app.onrender.com
```

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (free tier available)

2. **Configure Database**
   ```bash
   # Database name: nexaura-docs
   # Collections will be created automatically
   ```

3. **Setup Network Access**
   - Add `0.0.0.0/0` to IP whitelist (for Render)
   - Create database user with read/write permissions

4. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nexaura-docs
   ```

## 🖥️ Backend Deployment (Render)

1. **Create Render Account**
   - Go to [Render](https://render.com)
   - Connect your GitHub repository

2. **Create Web Service**
   - Choose "Web Service"
   - Connect repository: `your-repo/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**
   - Add all backend environment variables
   - Set `NODE_ENV=production`

4. **Deploy Settings**
   ```yaml
   # render.yaml (optional)
   services:
     - type: web
       name: nexaura-backend
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

## 🌐 Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Connect your GitHub repository

2. **Import Project**
   - Select your repository
   - Framework: Vite
   - Root Directory: `frontend-new`

3. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com
   ```

4. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## 🔧 Configuration Updates

### 1. Update CORS Origins
In `backend/middleware/security.js`:
```javascript
const corsOptions = {
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:3000', // for development
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 2. Update API URLs
In frontend environment files:
```env
# Production
VITE_API_URL=https://your-backend-app.onrender.com

# Development
VITE_API_URL=http://localhost:5001
```

## 🚀 Deployment Steps

### Step 1: Deploy Backend
1. Push code to GitHub
2. Create Render web service
3. Configure environment variables
4. Deploy and test endpoints

### Step 2: Deploy Frontend
1. Update `VITE_API_URL` with backend URL
2. Create Vercel project
3. Configure build settings
4. Deploy and test application

### Step 3: Test Production
1. **Authentication**: Test login/register
2. **File Upload**: Test document upload
3. **Payments**: Test Razorpay integration
4. **Admin Panel**: Test admin functions

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `https://your-backend-app.onrender.com/health`
- Frontend: Check Vercel deployment status

### Logs
- **Render**: View logs in dashboard
- **Vercel**: View function logs and analytics

### Performance
- Monitor response times
- Check database performance
- Monitor file storage usage

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Rotate API keys regularly

2. **Database Security**
   - Use MongoDB Atlas security features
   - Regular backups
   - Monitor access logs

3. **API Security**
   - Rate limiting enabled
   - Input validation
   - CORS properly configured

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // Update backend CORS configuration
   origin: ['https://your-domain.vercel.app']
   ```

2. **Environment Variables**
   ```bash
   # Check if variables are loaded
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```

3. **Database Connection**
   ```javascript
   // Check MongoDB connection
   mongoose.connection.readyState // 1 = connected
   ```

4. **File Upload Issues**
   - Check Cloudinary configuration
   - Verify file size limits
   - Check network connectivity

## 📈 Scaling Considerations

### Performance Optimization
- Enable Cloudinary auto-optimization
- Use CDN for static assets
- Implement caching strategies

### Database Scaling
- Monitor MongoDB Atlas metrics
- Consider read replicas for high traffic
- Implement database indexing

### Cost Optimization
- Monitor Render usage
- Optimize Cloudinary storage
- Use Vercel analytics

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Add Render deployment steps

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        # Add Vercel deployment steps
```

## 📞 Support

For deployment issues:
1. Check logs in respective platforms
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity

---

**Ready for Production! 🎉**

Your Nexaura Document Hub is now ready for production deployment with enterprise-grade security, scalability, and performance.