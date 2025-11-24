// middleware/createUploader.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

function createUploader(folderName) {
  // Path lengkap upload
  const uploadPath = path.join(__dirname, '..', 'uploads', folderName);

  // Buat folder kalau belum ada
  if (!fs.existsSync(uploadPath)) {
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
    } catch (err) {
      console.error('Error creating upload folder:', err);
    }
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      cb(null, `${folderName}-${uniqueSuffix}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit (optional)
  });
}

module.exports = createUploader;
