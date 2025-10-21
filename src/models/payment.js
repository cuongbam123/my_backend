const { Schema, model } = require('mongoose');

const paymentSchema = new Schema({
  pay_name: {
    type: String,
    enum: ['COD', 'PAYPAL'],
    required: true,
    unique: true,
  },
}, { collection: 'payment' });

module.exports = model('Payment', paymentSchema);
