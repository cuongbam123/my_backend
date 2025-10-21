const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.get('/', verifyToken, isAdmin, paymentController.getAllPayments);
router.post('/', verifyToken, isAdmin, paymentController.createPayment);

module.exports = router;