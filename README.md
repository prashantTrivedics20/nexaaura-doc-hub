# Nexaura Developer Hub

A comprehensive MERN stack developer documentation platform with admin dashboard, OTP authentication, and cloud storage integration.

**Company:** [Nexaura IT Solutions](https://www.nexaurait.online/)  
**LinkedIn:** [Nexaura Company Page](https://www.linkedin.com/company/114344571/)  
**Year:** 2026

## 🚀 Features

### User Features
- **OTP-Based Authentication**: Secure email-based OTP login and registration
- **Document Access**: Browse and download premium developer documents
- **Search & Filter**: Advanced search and filtering capabilities
- **Responsive Design**: Modern dark theme UI with Material-UI
- **Premium Content**: Access to Full Stack & DSA learning materials

### Admin Features
- **Document Management**: Upload, edit, delete documents with full CRUD operations
- **User Management**: Create, manage, and control user accounts
- **Analytics Dashboard**: Real-time statistics and insights
- **Category Management**: Organize documents by categories
- **File Upload**: Support for large files (up to 50MB) with Cloudinary integration
- **Access Control**: Role-based permissions (Admin/User)

## 🛠️ Tech Stack

### Frontend
- **React 19.2.5** with Vite
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **React Hook Form** for form handling
- **TanStack Query** for data fetching
- **Notistack** for notifications
- **React Dropzone** for file uploads

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** for database
- **Cloudinary** for file storage
- **JWT** for authentication
- **Nodemailer** for email OTP
- **Express Validator** for validation
- **Bcrypt** for password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for OTP emails)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nexa-dochub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
PORT=5001
FRONTEND_URL=http://localhost:5174
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5173
MAX_FILE_SIZE=52428800
```

**Important**: 
- Get Gmail App Password from: https://support.google.com/accounts/answer/185833
- MongoDB Atlas connection string from: https://cloud.mongodb.com
- Cloudinary credentials from: https://cloudinary.com/console

Start backend server:
```bash
npm start
```

Backend will run on: http://localhost:5001

### 3. Frontend Setup

```bash
cd frontend-new
npm install
```

Create `.env` file in frontend-new folder:
```env
VITE_API_URL=http://localhost:5001
```

Start frontend development server:
```bash
npm run dev
```

Frontend will run on: http://localhost:5174 (or next available port)

## 🎯 Usage

### First Time Setup

1. **Start Backend**: Navigate to `backend` folder and run `npm start`
2. **Start Frontend**: Navigate to `frontend-new` folder and run `npm run dev`
3. **Access Application**: Open http://localhost:5174 in your browser

### Creating Admin Account

1. Register a new account through the sign-up flow
2. Manually update the user role in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

### Testing the Application

#### User Flow:
1. Go to Sign In page
2. Enter email and request OTP
3. Check email for 6-digit code
4. Enter OTP to complete login
5. Browse documents on Dashboard
6. Download documents
7. View Premium content

#### Admin Flow:
1. Login with admin account
2. Access Admin Dashboard
3. Upload documents via Document Management
4. Manage users via User Management
5. View analytics and statistics

## 📁 Project Structure

```
nexa-dochub/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   ├── database.js         # MongoDB connection
│   │   └── email.js            # Email service
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   ├── errorHandler.js    # Error handling
│   │   ├── monitoring.js       # Request monitoring
│   │   └── security.js         # Security middleware
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Document.js         # Document model
│   │   ├── Category.js         # Category model
│   │   ├── EmailVerification.js # OTP model
│   │   └── DocumentVersion.js  # Version control
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── documents.js        # Document routes
│   │   └── users.js            # User management routes
│   ├── .env                    # Environment variables
│   ├── server.js               # Express server
│   └── package.json
│
├── frontend-new/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── Layout.jsx  # Main layout with sidebar
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── PublicRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── pages/
│   │   │   ├── SignIn.jsx      # Login/Register page
│   │   │   ├── Dashboard.jsx   # User dashboard
│   │   │   ├── Premium.jsx     # Premium content
│   │   │   └── Admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── DocumentManagement.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       └── Analytics.jsx
│   │   ├── services/
│   │   │   └── authService.js  # API service
│   │   ├── theme/
│   │   │   └── theme.js        # MUI theme configuration
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── .env                    # Environment variables
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
└── README.md
```

## 🔐 Security Features

- JWT-based authentication
- OTP email verification
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Secure file upload with size limits
- Role-based access control

## 🚀 Deployment

### Backend (Render)

1. Create new Web Service on Render
2. Connect your repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env`
6. Deploy

### Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend-new folder
3. Run: `vercel`
4. Set environment variable: `VITE_API_URL=your_backend_url`
5. Deploy

## 📝 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login/register
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Documents
- `GET /api/documents` - Get all documents (with filters)
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents/upload` - Upload document (Admin)
- `PUT /api/documents/:id` - Update document (Admin)
- `DELETE /api/documents/:id` - Delete document (Admin)
- `GET /api/documents/:id/download` - Download document
- `GET /api/documents/admin/statistics` - Get statistics (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check MongoDB Atlas connection string
- Ensure IP whitelist includes your IP
- Verify database user credentials

**Email OTP Not Sending:**
- Verify Gmail App Password is correct
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Enable "Less secure app access" if needed

**File Upload Fails:**
- Check Cloudinary credentials
- Verify file size is under 50MB
- Ensure CLOUDINARY_* variables are set

### Frontend Issues

**API Connection Error:**
- Verify backend is running on port 5001
- Check VITE_API_URL in frontend .env
- Ensure CORS is configured correctly

**Build Errors:**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Clear Vite cache: `npm run dev -- --force`

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Contact: pk980480@gmail.com

## 🎉 Acknowledgments

- Material-UI for the component library
- Cloudinary for file storage
- MongoDB Atlas for database hosting
- Vite for fast development experience
