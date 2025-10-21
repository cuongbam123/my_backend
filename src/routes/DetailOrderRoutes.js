const express = require('express');
const router = express.Router();
const detailOrderController = require('../controllers/DetailOrderController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Admin xem tất cả chi tiết
router.get('/', verifyToken, isAdmin, detailOrderController.listDetailOrders);

// Lấy chi tiết của 1 đơn (admin hoặc user chính chủ)
router.get('/:orderId', verifyToken, detailOrderController.getDetailOrdersByOrderId);

// CRUD cơ bản
router.get('/detail/:id', verifyToken, detailOrderController.getDetailOrder);
router.post('/', verifyToken, isAdmin, detailOrderController.createDetailOrder);
router.put('/:id', verifyToken, isAdmin, detailOrderController.updateDetailOrder);
router.delete('/:id', verifyToken, isAdmin, detailOrderController.deleteDetailOrder);

module.exports = router;
