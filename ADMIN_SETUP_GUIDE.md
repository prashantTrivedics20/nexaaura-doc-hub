# 👑 Admin Setup Guide

## Quick Admin Setup

To create the admin user with the specified credentials, follow these steps:

### 1. **Prerequisites**
Make sure you have:
- ✅ MongoDB running (local or Atlas)
- ✅ Backend dependencies installed (`npm install` in backend folder)
- ✅ Environment variables configured (`.env` file)

### 2. **Run Admin Setup**

#### Option A: Complete Production Setup (Recommended)
```bash
cd backend
npm run setup:production
```

This will create:
- 👤 Admin user with your credentials
- 📁 Default document categories
- ⚙️ Initial system settings

#### Option B: Admin User Only
```bash
cd backend
npm run seed:admin
```

This creates only the admin user.

### 3. **Admin Credentials Created**

**Email:** `nexaaurait@gmail.com`  
**Password:** `trivedi_cs1`  
**Role:** `admin`

### 4. **Access Admin Panel**

1. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend-new
   npm run dev
   ```

2. **Login:**
   - Go to: http://localhost:3000/signin
   - Use the admin credentials above
   - After login, navigate to: http://localhost:3000/app/admin

### 5. **Admin Panel Features**

Once logged in as admin, you'll have access to:

- 📊 **Admin Dashboard** - System overview and statistics
- 👥 **User Management** - Create, edit, delete users
- 📄 **Document Management** - Upload and organize documents
- 📁 **Category Management** - Create and manage document categories
- 📈 **Analytics** - View system analytics and reports
- ⚙️ **System Settings** - Configure platform settings

### 6. **Default Categories Created**

The setup creates these categories:
- 📋 **Policies** - Company policies and procedures
- 📝 **Procedures** - Step-by-step workflows
- 📖 **Manuals** - User manuals and documentation
- 📊 **Reports** - Reports and analytics documents
- 📄 **Contracts** - Legal contracts and agreements
- 🎓 **Training Materials** - Training resources
- 📋 **Templates** - Document templates and forms
- 📁 **Other** - Miscellaneous documents

### 7. **System Settings Configured**

Default settings:
- 🔒 **Free Document Access**: `Disabled` (Premium required)
- 🔧 **Maintenance Mode**: `Disabled`
- 👥 **User Registration**: `Enabled`
- 💳 **Payment Required**: `Enabled`

### 8. **Troubleshooting**

#### Database Connection Issues
```bash
# Check your .env file has correct MongoDB URI
MONGODB_URI=mongodb://localhost:27017/nexaura-docs
# or for Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexaura-docs
```

#### Admin Already Exists
If you see "Admin user already exists", the script will ask if you want to update the existing admin with new credentials.

#### Permission Issues
```bash
# Make sure script is executable
chmod +x backend/scripts/setupProduction.js
```

### 9. **Verification**

After setup, verify everything works:

1. ✅ Login with admin credentials
2. ✅ Access admin dashboard at `/app/admin`
3. ✅ Check that categories are visible
4. ✅ Try uploading a test document
5. ✅ Verify user management works
6. ✅ Check system settings page

### 10. **Production Deployment**

For production deployment:

1. **Run setup on production database:**
   ```bash
   NODE_ENV=production npm run setup:production
   ```

2. **Update environment variables** for production
3. **Deploy to Vercel/Render** using deployment guides

---

## 🎉 You're Ready!

Your admin account is now set up and ready to use. You can start managing your document hub with full administrative privileges.

### Next Steps:
1. 📤 Upload some test documents
2. 👥 Create additional user accounts (if needed)
3. ⚙️ Configure system settings as needed
4. 🚀 Deploy to production when ready

---

**Need Help?** Check the [Production Checklist](./PRODUCTION_CHECKLIST.md) or [Deployment Guide](./DEPLOYMENT_PRODUCTION.md) for more information.