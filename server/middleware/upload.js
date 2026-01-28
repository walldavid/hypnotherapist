const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (files will be uploaded to GCS)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types for digital products
  const allowedTypes = [
    'application/pdf',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'application/zip',
    'application/x-zip-compressed',
    // Image types for product previews
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: PDF, Audio (MP3, WAV, OGG), Video (MP4, MOV, AVI), ZIP, Images (JPG, PNG, WEBP, GIF)`), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
    files: 10 // Maximum 10 files per upload
  },
  fileFilter: fileFilter
});

// Middleware to handle single file upload
exports.uploadSingle = upload.single('file');

// Middleware to handle multiple file uploads
exports.uploadMultiple = upload.array('files', 10);

// Middleware to handle both product files and images
exports.uploadProductFiles = upload.fields([
  { name: 'files', maxCount: 10 },
  { name: 'images', maxCount: 5 }
]);

// Custom error handler for multer errors
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 500MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Maximum is 10 files per upload.'
      });
    }
    return res.status(400).json({
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: err.message
    });
  }
  
  next();
};

// Validate file buffer and metadata
exports.validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!file.buffer) {
    throw new Error('Invalid file buffer');
  }

  if (!file.mimetype) {
    throw new Error('Invalid file type');
  }

  if (!file.originalname) {
    throw new Error('Invalid filename');
  }

  return true;
};

// Get file extension from mimetype
exports.getExtensionFromMimetype = (mimetype) => {
  const mimetypeMap = {
    'application/pdf': '.pdf',
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
  };

  return mimetypeMap[mimetype] || '';
};

// Format file size for display
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
