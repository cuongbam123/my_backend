const { Schema, model } = require("mongoose");

const detailOrderSchema = new Schema(
  {
    _id: { type: String, required: true }, // uuid
    id_order: { type: String, ref: "Order", required: true },
    id_product: { type: String, ref: "Product", required: true },

    // Thông tin snapshot sản phẩm tại thời điểm đặt hàng
    nameProduct: { type: String, required: true },
    brand: { type: String },
    category: { type: String }, // vd: Serum, Nước tẩy trang, ...
    image: { type: String },
    priceProduct: { type: Number, required: true },
    count: { type: Number, required: true },
    size: { type: String, default: "M" },

    // Phòng khi có khuyến mãi, giảm giá lúc mua
    discountAtPurchase: { type: Number, default: 0 }, // %
  },
  {
    collection: "detail_order",
    timestamps: true,
  }
);

module.exports = model("DetailOrder", detailOrderSchema);
