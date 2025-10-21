const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.get('/', verifyToken, isAdmin, couponController.getAllCoupons);
router.post('/', verifyToken, isAdmin, couponController.createCoupon);

module.exports = router;