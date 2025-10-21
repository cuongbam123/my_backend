const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  content:  { type: String },
  rating:   { type: Number, min: 1, max: 5 },
}, { timestamps: true, collection: 'comments' });

module.exports = model('Comment', commentSchema);
