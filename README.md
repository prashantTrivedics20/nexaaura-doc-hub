# 📚 Nexaura Document Hub

A modern, full-stack document management platform built with React, Node.js, and MongoDB. Designed for organizations to efficiently manage, organize, and access documents with enterprise-grade security and user-friendly interface.

**Company:** [Nexaura IT Solutions](https://www.nexaurait.online/)  
**LinkedIn:** [Nexaura Company Page](https://www.linkedin.com/company/114344571/)  
**Year:** 2026

## ✨ Features

### 🔐 **Authentication & Security**
- Email/Password authentication with JWT
- Role-based access control (Admin/User)
- Premium subscription system
- Secure file upload and storage

### 📄 **Document Management**
- Multi-category document organization
- Advanced search and filtering
- Real-time document viewer
- Bulk upload capabilities
- Download tracking and analytics

### 👑 **Admin Panel**
- User management system
- Document approval workflow
- Category management
- System analytics and reporting
- Premium access control

### 💳 **Payment Integration**
- Razorpay payment gateway
- One-time premium access (₹30)
- Automatic access management
- Payment history tracking

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Dark theme with gradient accents
- Smooth animations and transitions
- Professional dashboard interface
- Real-time statistics and progress tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Notistack** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Cloudinary** - File storage and optimization

### Security & Performance
- **Helmet** - Security headers
- **Rate limiting** - API protection
- **Input validation** - Data sanitization
- **Compression** - Response optimization
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file storage)
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nexaura-document-hub.git
   cd nexaura-document-hub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend-new
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

4. **Environment Configuration**

   **Backend (.env)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/nexaura-docs
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   ```

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5001
   ```

## 📱 Usage

### For Users
1. **Register/Login** - Create account with email/password
2. **Browse Documents** - Explore categorized documents
3. **Search & Filter** - Find specific content quickly
4. **Upgrade to Premium** - Access all documents for ₹30
5. **Download & View** - Access documents with built-in viewer

### For Admins
1. **User Management** - Manage user accounts and permissions
2. **Document Upload** - Add new documents with categories
3. **Analytics** - View usage statistics and reports
4. **System Settings** - Configure platform settings
5. **Category Management** - Organize document categories

## 🏗️ Project Structure

```
nexaura-document-hub/
├── backend/                 # Node.js backend
│   ├── config/             # Database and service configs
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── scripts/           # Utility scripts
│   └── server.js          # Main server file
├── frontend-new/          # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── theme/         # MUI theme config
│   └── package.json
├── scripts/               # Deployment scripts
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/download` - Download document

### Admin
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

### Statistics
- `GET /api/stats/dashboard` - Dashboard stats
- `GET /api/stats/admin` - Admin statistics

## 🎨 Design System

### Color Palette
- **Primary**: Purple (#8B5CF6)
- **Secondary**: Pink (#EC4899)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Background**: Dark Blue (#0A0A0F)

### Typography
- **Font Family**: Inter, system fonts
- **Headings**: 800-900 weight
- **Body**: 400-600 weight
- **Responsive**: Clamp-based sizing

### Components
- **Cards**: Glass morphism effect
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Floating labels with validation
- **Navigation**: Collapsible sidebar with animations

## 🚀 Deployment

### Production Deployment
1. **Backend**: Deploy to Render/Railway/Heroku
2. **Frontend**: Deploy to Vercel/Netlify
3. **Database**: MongoDB Atlas
4. **Storage**: Cloudinary

See [DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md) for detailed deployment guide.

### Environment Setup
- Configure production environment variables
- Set up CORS for production domains
- Enable security headers and rate limiting
- Configure backup and monitoring

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize all inputs
- **File Upload Security** - Type and size validation
- **CORS Protection** - Restrict cross-origin requests
- **Security Headers** - Helmet.js implementation

## 📊 Analytics & Monitoring

- **Real-time Statistics** - User and document metrics
- **Performance Monitoring** - Response time tracking
- **Error Logging** - Comprehensive error tracking
- **Health Checks** - System status monitoring
- **Usage Analytics** - Document access patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI** - For the excellent component library
- **Cloudinary** - For reliable file storage
- **Razorpay** - For seamless payment integration
- **MongoDB** - For flexible document storage

## 📞 Support

For support and questions:
- **Email**: nexaaurait@gmail.com
- **Website**: [nexaurait.online](https://www.nexaurait.online/)
- **LinkedIn**: [Nexaura IT Solutions](https://www.linkedin.com/company/114344571/)

---

**Built with ❤️ by Nexaura IT Solutions**

*Empowering organizations with intelligent document management.*
