const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  name:        { type: String, required: true },
  brand:       { type: String }, // thương hiệu
  price:       { type: Number, required: true },
  image:       { type: String },
  description: { type: String },
  ingredients: { type: String }, // thành phần
  skinType:    { type: String, enum: ['all', 'dry', 'oily', 'sensitive', 'normal'], default: 'all' },
  stock:       { type: Number, default: 0 },
  expiryDate:  { type: Date }, // hạn sử dụng
  discount:    { type: Number, default: 0 }, // %
  category:    { type: Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true, collection: 'products' });

module.exports = model('Product', productSchema);
