const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên ảnh tránh trùng
  }
});

const upload = multer({ storage: storage });

// API upload ảnh
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có ảnh được tải lên.' });
  }
  
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  res.status(200).json({ imageUrl });
});

module.exports = router;
