const multer = require('multer');
const path = require('path');
const log = require('../utils/logger');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    log.upload('接收文件: %s -> %s', file.originalname, filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    log.upload('文件类型不支持: %s', file.mimetype);
    cb(new Error('仅支持 JPG、PNG、GIF、WebP 格式的图片'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    files: 3
  }
});

module.exports = upload;
