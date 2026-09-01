const multer = require('multer');

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter(req, file, callback) {
    if (!allowed.has(file.mimetype)) return callback(new Error('Only JPEG, PNG and WebP images are allowed.'));
    callback(null, true);
  }
});

module.exports = upload;
