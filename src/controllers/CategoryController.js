const CategoryService = require("../services/CategoryService");

module.exports = {
  index: async (req, res, next) => {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      if (!category) return res.status(404).send("Không tìm thấy danh mục");
      res.json(category);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const newCategory = await CategoryService.createCategory(req.body);
      res.status(201).json(newCategory);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const updated = await CategoryService.updateCategory(req.params.id, req.body);
      if (!updated) return res.status(404).send("Không tìm thấy danh mục");
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const deleted = await CategoryService.deleteCategory(req.params.id);
      if (!deleted) return res.status(404).send("Không tìm thấy danh mục");
      res.json({ message: "Đã xóa danh mục" });
    } catch (err) {
      next(err);
    }
  },
};
