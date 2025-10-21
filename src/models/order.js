const { Schema, model } = require("mongoose");

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "shipping", "completed", "cancelled"],
      default: "pending",
    },
    paid: { type: Boolean, default: false },
    shippingFee: { type: Number, default: 0 },
    payment: {
      type: String,
      enum: ["COD", "PAYPAL"],
      required: true,
      default: "COD",
    },
    note: { type: Schema.Types.ObjectId, ref: "Note" },
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon" },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "orders" }
);

module.exports = model("Order", orderSchema);
