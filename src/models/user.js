const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: false, unique: true, sparse: true },
  birthday:      { type: Date,   required: false }, // ngày sinh
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' }, // Phân quyền
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
