const paypalService = require('../services/PaypalService');
const orderService = require('../services/OrderService');

exports.verifyPaypalPayment = async (req, res) => {
  try {
    const { orderId, orderData } = req.body;
    const result = await paypalService.verifyPayment(orderId);

    if (result.status === 'COMPLETED') {
      const { order, detailOrders } = await orderService.createOrder(orderData);
      return res.status(201).json({ success: true, message: 'Đã thanh toán và tạo đơn hàng', order, detailOrders });
    } else {
      return res.status(400).json({ success: false, message: 'Thanh toán chưa hoàn tất' });
    }
  } catch (error) {
    console.error('verifyPaypalPayment error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xác minh thanh toán PayPal' });
  }
};
