const detailService = require('../services/DetailOrderService');
const Order = require('../models/order');

// 🧾 Tạo chi tiết đơn hàng riêng lẻ (ít dùng, vì OrderService đã tạo hàng loạt)
exports.createDetailOrder = async (req, res, next) => {
  try {
    const data = req.body;
    const detail = await detailService.createDetailOrder(data);
    res.status(201).json(detail);
  } catch (err) {
    next(err);
  }
};

// 🧾 Lấy chi tiết sản phẩm theo id_order
exports.getDetailOrdersByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Kiểm tra quyền: chỉ admin hoặc chính chủ đơn mới được xem
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (req.user.role !== 'admin' && order.id_user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền xem chi tiết đơn này" });
    }

    const details = await detailService.getDetailOrdersByOrderId(orderId);
    if (!details.length) return res.status(404).json({ message: "Đơn hàng không có sản phẩm" });

    res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
};

// 🧾 Lấy toàn bộ chi tiết đơn hàng (admin)
exports.listDetailOrders = async (req, res, next) => {
  try {
    const details = await detailService.getAllDetailOrders();
    res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
};

// 🧾 Lấy chi tiết theo ID
exports.getDetailOrder = async (req, res, next) => {
  try {
    const detail = await detailService.getDetailOrderById(req.params.id);
    if (!detail) return res.status(404).end();
    res.json({ success: true, data: detail });
  } catch (err) {
    next(err);
  }
};

// 🧾 Cập nhật chi tiết (admin)
exports.updateDetailOrder = async (req, res, next) => {
  try {
    const detail = await detailService.updateDetailOrder(req.params.id, req.body);
    if (!detail) return res.status(404).end();
    res.json({ success: true, data: detail });
  } catch (err) {
    next(err);
  }
};

// 🧾 Xoá chi tiết đơn (admin)
exports.deleteDetailOrder = async (req, res, next) => {
  try {
    await detailService.deleteDetailOrder(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
