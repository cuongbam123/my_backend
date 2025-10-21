const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Cấu hình PayPal environment (sandbox hoặc live)
function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

// Trả về client PayPal
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
