const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { client } = require('../paypal');

exports.verifyPayment = async (orderId) => {
  const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);
  const response = await client().execute(request);
  return response.result;
};
