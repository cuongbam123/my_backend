const mongoose = require("mongoose");
const { Schema } = mongoose;

const productViewSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    session_id: { type: String, required: false }, // nếu user chưa đăng nhập
    ip: { type: String, required: false },
    user_agent: { type: String, required: false },
  },
  { timestamps: true, collection: "product_views" }
);

// index để aggregate nhanh
productViewSchema.index({ product_id: 1, createdAt: -1 });
productViewSchema.index({ user_id: 1, createdAt: -1 });
productViewSchema.index({ session_id: 1, createdAt: -1 });

module.exports = mongoose.model("ProductView", productViewSchema);
