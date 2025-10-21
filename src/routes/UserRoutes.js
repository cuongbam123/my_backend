const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const multer = require('multer');

// ✅ Cấu hình multer cho phép parse form-data (có hoặc không file)
const upload = multer();

// ✅ Các route không có file dùng upload.none()
router.post('/register', UserController.register);
router.post('/login', UserController.login);

router.put('/users/update-profile', verifyToken, upload.none(), UserController.updateProfile);
router.put('/users/:id', verifyToken, upload.none(), UserController.updateUser);
router.get('/profile', verifyToken, UserController.getProfile);

// Admin routes
router.get('/admin/users', verifyToken, isAdmin, UserController.index);
router.get('/admin/users/:id', verifyToken, isAdmin, UserController.user);
router.delete('/admin/users/:id', verifyToken, isAdmin, UserController.deleteUser);

module.exports = router;
