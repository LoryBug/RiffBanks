const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    audio: /mp3|wav|ogg|m4a|flac/,
    image: /jpeg|jpg|png|gif|webp/
  };

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimeType = file.mimetype;

  if (allowedTypes.audio.test(ext) || mimeType.startsWith('audio/')) {
    req.fileType = 'audio';
    return cb(null, true);
  }

  // Check image
  if (allowedTypes.image.test(ext) || mimeType.startsWith('image/')) {
    req.fileType = 'image';
    return cb(null, true);
  }

  cb(new Error('Invalid file type. Only audio and image files are allowed.'));
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  },
  fileFilter
});

// Error handler middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, handleUploadError };