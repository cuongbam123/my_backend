const Category = require("../models/category");

const getAllCategories = async () => await Category.find();
const getCategoryById = async (id) => await Category.findById(id);
const createCategory = async (data) => await Category.create(data);
const updateCategory = async (id, data) => await Category.findByIdAndUpdate(id, data, { new: true });
const deleteCategory = async (id) => await Category.findByIdAndDelete(id);

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
