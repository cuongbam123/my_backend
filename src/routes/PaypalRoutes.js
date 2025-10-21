const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/PaypalController');
const { verifyToken } = require('../middlewares/auth');

router.post('/verify', verifyToken, paypalController.verifyPaypalPayment);

module.exports = router;

