const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  upload_preset: undefined, // Don't use upload presets that might have size limits
});

// Configure Cloudinary storage for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexa-doc-hub/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    resource_type: 'raw', // Use 'raw' for PDFs and documents (not 'auto' or 'image')
    type: 'upload', // Make files publicly accessible
    access_mode: 'public', // Ensure public access
    chunk_size: 6000000, // 6MB chunks for large files
    // Remove max_file_size to let multer handle it
    public_id: (req, file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      return `${originalName}-${timestamp}`;
    },
  },
});

// Configure Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexa-doc-hub/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' }
    ],
    public_id: (req, file) => {
      return `avatar-${req.user.id}-${Date.now()}`;
    },
  },
});

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.'), false);
  }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and GIF files are allowed.'), false);
  }
};

// Multer configuration for document uploads
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for Cloudinary free plan
    fieldSize: 10 * 1024 * 1024, // 10MB for field data
    files: 1, // Maximum 1 file
    fields: 20 // Maximum 20 fields
  },
});

// Multer configuration for avatar uploads
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
  },
});

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get file info from Cloudinary
const getFileInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting file info from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadDocument,
  uploadAvatar,
  deleteFromCloudinary,
  getFileInfo
};