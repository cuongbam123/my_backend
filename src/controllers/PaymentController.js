const paymentService = require('../services/PaymentService');

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy phương thức thanh toán' });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi tạo phương thức thanh toán' });
  }
};
