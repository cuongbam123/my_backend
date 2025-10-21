
const Payment = require('../models/payment');

async function getAllPayments() {
  return await Payment.find();
}

async function createPayment(data) {
  const payment = new Payment(data);
  return await payment.save();
}

module.exports = { getAllPayments, createPayment };

