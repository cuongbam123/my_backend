const Product = require("../models/product");
const Category = require("../models/category");


const getAllProducts = async (limit = 0, skip = 0, sort = {}, filter = {}) =>
  await Product.find(filter)
    .populate("category", "name")
    .sort(sort)
    .limit(limit)
    .skip(skip);

const countProducts = async (filter) => await Product.countDocuments(filter);
const getProductById = async (id) => await Product.findById(id).populate("category", "name");
const createProduct = async (data) => await Product.create(data);
const updateProduct = async (id, data) => await Product.findByIdAndUpdate(id, data, { new: true });
const deleteProduct = async (id) => await Product.findByIdAndDelete(id);

module.exports = {
  getAllProducts,
  countProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
