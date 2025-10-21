// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// 🛒 User: tạo đơn hàng
router.post("/", verifyToken, orderController.createOrder);

// 👤 User: xem đơn hàng của chính mình
router.get("/my-orders", verifyToken, orderController.getMyOrders);

// 🧾 Xem chi tiết 1 đơn hàng (admin hoặc chính chủ)
router.get("/:id", verifyToken, orderController.getOrderById);

// 👑 Admin: xem tất cả đơn
router.get("/", verifyToken, isAdmin, orderController.getAllOrders);

// ✏️ Admin: cập nhật đơn hàng
router.put("/:id", verifyToken, isAdmin, orderController.updateOrder);

// 🗑️ Admin: xóa đơn hàng
router.delete("/:id", verifyToken, isAdmin, orderController.deleteOrder);

router.get("/stats/monthly", verifyToken, isAdmin, orderController.getMonthlyRevenue);


module.exports = router;
