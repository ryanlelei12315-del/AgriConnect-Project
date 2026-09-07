/* eslint-env node */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, webp, gif).'));
  }
};

const commonLimits = { fileSize: 5 * 1024 * 1024 }; // 5MB

// Listing images (used by produce uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `listing-${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

// Profile images (avatar uploads)
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `profile-${unique}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({ storage, limits: commonLimits, fileFilter });
const uploadProfile = multer({ storage: profileStorage, limits: commonLimits, fileFilter });

module.exports = {
  upload,
  uploadSingle: (fieldName = 'image') => upload.single(fieldName),
  uploadProfile,
  uploadProfileSingle: (fieldName = 'image') => uploadProfile.single(fieldName),
};
