const couponService = require('../services/CouponService');

/**
 * Lấy tất cả mã giảm giá (chỉ admin)
 */
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy mã giảm giá' });
  }
};

/**
 * Tạo mới mã giảm giá (admin)
 */
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi tạo mã giảm giá' });
  }
};
