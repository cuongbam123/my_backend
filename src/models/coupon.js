const { Schema, model } = require('mongoose');

const couponSchema = new Schema({
  code:       { type: String, unique: true, required: true },
  discount:   { type: Number, required: true }, // %
  expiresAt:  { type: Date },
}, { collection: 'coupons' });

module.exports = model('Coupon', couponSchema);
