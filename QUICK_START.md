# Nexaura Developer Hub Quick Start Guide

## ✅ Current Status

Your Nexaura Developer Hub application is now ready to use!

### What's Running:
- ✅ **Backend Server**: Running on http://localhost:5001
- ✅ **Frontend App**: Running on http://localhost:5174
- ✅ **MongoDB**: Connected to MongoDB Atlas
- ✅ **Cloudinary**: Configured for file uploads

## 🚀 Access the Application

Open your browser and go to: **http://localhost:5174**

## 📝 First Steps

### 1. Create Your First Account

1. Click on **"Sign Up"** on the sign-in page
2. Fill in your details:
   - First Name & Last Name
   - Username (min 3 characters)
   - Password (min 6 characters)
   - Email address
3. Click **"Create Account"**
4. Check your email for the 6-digit OTP code
5. Enter the OTP to complete registration
6. You'll be logged in automatically!

### 2. Make Yourself an Admin

To access admin features, you need to update your role in MongoDB:

**Option A: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to your MongoDB Atlas cluster
3. Navigate to `nexa-doc-hub` database → `users` collection
4. Find your user document
5. Edit the document and change `role: "user"` to `role: "admin"`
6. Save changes
7. Logout and login again

**Option B: Using MongoDB Shell**
```javascript
use nexa-doc-hub
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### 3. Explore User Features

As a regular user, you can:
- ✅ Browse all available documents
- ✅ Search and filter documents by category
- ✅ Download documents
- ✅ View document details
- ✅ Access Premium learning content
- ✅ Update your profile

### 4. Explore Admin Features

After becoming an admin, you'll see additional menu items:

#### Admin Dashboard
- View system statistics
- Monitor recent uploads
- Track user activity
- Quick access to all admin features

#### Document Management
- **Upload Documents**: Drag & drop or click to upload (PDF, DOC, DOCX, TXT, Images)
- **Edit Documents**: Update title, description, category, status
- **Delete Documents**: Remove documents permanently
- **Organize**: Categorize documents (Policy, Procedure, Manual, Report, Contract, Other)
- **Control Access**: Set documents as public or private

#### User Management
- **Create Users**: Add new users with specific roles
- **Edit Users**: Update user information and roles
- **Activate/Deactivate**: Control user access
- **Delete Users**: Remove users and their data
- **View Statistics**: See user activity and document uploads

#### Analytics
- View total documents, downloads, and users
- See category breakdown
- Track most downloaded documents
- Monitor recent uploads
- Analyze system usage

## 🎯 Common Tasks

### Upload a Document (Admin Only)

1. Go to **Admin → Document Management**
2. Click **"Upload Document"** button
3. Drag & drop your file or click to browse
4. Fill in document details:
   - Title (required)
   - Category (required)
   - Description (optional)
   - Tags (optional)
   - Status (Draft/Published/Archived)
5. Click **"Upload"**
6. Wait for upload to complete

### Download a Document

1. Go to **Dashboard**
2. Browse or search for documents
3. Click **"Download"** button on any document
4. File will open in a new tab or download automatically

### Manage Users (Admin Only)

1. Go to **Admin → User Management**
2. To create a user:
   - Click **"Create User"**
   - Fill in user details
   - Select role (User/Admin)
   - Click **"Create User"**
3. To edit a user:
   - Click the edit icon on any user row
   - Update information
   - Click **"Update User"**
4. To activate/deactivate:
   - Click the status toggle icon
   - User will be activated or deactivated

## 🔧 Configuration

### Email OTP Setup

If OTP emails are not working:

1. Go to your Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
4. Update `backend/.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```
5. Restart backend server

### File Upload Limits

Current limit: **50MB per file**

To change:
1. Update `backend/.env`:
   ```env
   MAX_FILE_SIZE=104857600  # 100MB in bytes
   ```
2. Restart backend server

### Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: PNG, JPG, JPEG
- **Others**: Can be configured in `backend/config/cloudinary.js`

## 🎨 Customization

### Change Theme Colors

Edit `frontend-new/src/theme/theme.js`:

```javascript
primary: {
  main: '#8B5CF6', // Change this to your color
  // ...
}
```

### Add New Document Categories

1. Update category options in:
   - `frontend-new/src/pages/Admin/DocumentManagement.jsx`
   - `backend/models/Document.js`

2. Add category colors in:
   - `frontend-new/src/pages/Dashboard.jsx`
   - `frontend-new/src/pages/Admin/DocumentManagement.jsx`

## 📱 Testing Checklist

### User Features
- [ ] Register new account
- [ ] Receive OTP email
- [ ] Login with OTP
- [ ] Browse documents
- [ ] Search documents
- [ ] Filter by category
- [ ] Download document
- [ ] View Premium page
- [ ] Update profile
- [ ] Logout

### Admin Features
- [ ] Access Admin Dashboard
- [ ] View statistics
- [ ] Upload document (small file)
- [ ] Upload document (large file ~40MB)
- [ ] Edit document
- [ ] Delete document
- [ ] Create user
- [ ] Edit user
- [ ] Activate/Deactivate user
- [ ] Delete user
- [ ] View Analytics

## 🐛 Common Issues

### "Network Error" on Login
- **Solution**: Check if backend is running on port 5001
- Run: `cd backend && npm start`

### "Failed to fetch documents"
- **Solution**: Ensure you're logged in and token is valid
- Try logging out and logging in again

### OTP Email Not Received
- **Solution**: 
  1. Check spam folder
  2. Verify EMAIL_USER and EMAIL_PASSWORD in backend/.env
  3. Ensure Gmail App Password is correct
  4. Check backend console for email errors

### File Upload Fails
- **Solution**:
  1. Check file size (must be under 50MB)
  2. Verify Cloudinary credentials in backend/.env
  3. Check backend console for errors
  4. Ensure file type is supported

### CORS Error
- **Solution**: 
  1. Check ALLOWED_ORIGINS in backend/.env includes http://localhost:5174
  2. Restart backend server

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review backend console logs for errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly

## 🎉 You're All Set!

Your Nexaura Developer Hub is ready to use. Start by creating your account and exploring the features!

**Happy Learning! 🚀**

---

**Company:** [Nexaura IT Solutions](https://www.nexaurait.online/)  
**LinkedIn:** [Nexaura Company Page](https://www.linkedin.com/company/114344571/)  
**Year:** 2026
