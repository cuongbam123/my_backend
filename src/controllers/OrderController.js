const mongoose = require("mongoose");
const orderService = require("../services/OrderService");
const Order = require("../models/order");

/** 🧾 Tạo đơn hàng */
exports.createOrder = async (req, res) => {
  try {
    const data = { ...req.body, user: req.user.id };
    const { order, detailOrders } = await orderService.createOrder(data);

    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      order,
      detailOrders,
    });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi tạo đơn hàng",
    });
  }
};

/** 👤 Lấy đơn hàng của user hiện tại */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "fullname email");

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("Lỗi getMyOrders:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

/** 👤 Xem chi tiết đơn hàng */
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Chỉ admin hoặc chính chủ mới được xem
    if (
      req.user.role !== "admin" &&
      order.user?._id?.toString() !== req.user.id?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem đơn hàng này",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("❌ Lỗi getOrderById:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết đơn hàng",
    });
  }
};


/** 👑 Admin: lấy tất cả đơn hàng */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ getAllOrders error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách đơn hàng",
    });
  }
};

/** ✏️ Cập nhật đơn hàng */
exports.updateOrder = async (req, res) => {
  try {
    const updated = await orderService.updateOrder(req.params.id, req.body);
    if (!updated)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });

    res.status(200).json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
      data: updated,
    });
  } catch (err) {
    console.error("❌ updateOrder error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật đơn hàng",
    });
  }
};

/** 🗑️ Xóa đơn hàng */
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await orderService.deleteOrder(req.params.id);
    if (!deleted)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });

    res.status(200).json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (err) {
    console.error("❌ deleteOrder error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi xóa đơn hàng",
    });
  }
};

/** 📊 Lấy doanh thu theo tháng */
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Chuyển sang format frontend cần
    const months = [
      "Tháng 1","Tháng 2","Tháng 3","Tháng 4",
      "Tháng 5","Tháng 6","Tháng 7","Tháng 8",
      "Tháng 9","Tháng 10","Tháng 11","Tháng 12"
    ];

    const formatted = months.map((m, i) => {
      const found = result.find((r) => r._id === i + 1);
      return {
        name: m,
        doanhThu: found ? found.totalRevenue : 0,
        soLuong: found ? found.count : 0,
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ getMonthlyRevenue error:", err);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thống kê doanh thu theo tháng",
    });
  }
};

