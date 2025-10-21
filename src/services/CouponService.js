
const Coupon = require('../models/coupon');

async function getAllCoupons() {
  return await Coupon.find();
}

async function createCoupon(data) {
  const coupon = new Coupon(data);
  return await coupon.save();
}

module.exports = { getAllCoupons, createCoupon };

