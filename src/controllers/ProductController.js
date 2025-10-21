const ProductService = require("../services/ProductService");

module.exports = {
  index: async (req, res, next) => {
  try {
    const { search = "", category = "", sortBy = "name", sortOrder = "asc" } = req.query;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
    const filter = {};

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    let products = await ProductService.getAllProducts(0, 0, sort, filter);

    // ✅ Thêm domain đầy đủ cho ảnh
    const host = `${req.protocol}://${req.get("host")}`;
    products = products.map((p) => ({
      ...p._doc,
      image: p.image?.startsWith("http") ? p.image : `${host}/uploads/${p.image}`,
    }));

    res.json({ data: products });
  } catch (err) {
    next(err);
  }
},


  show: async (req, res, next) => {
    try {
      const product = await ProductService.getProductById(req.params.id);
      if (!product) return res.status(404).send("Không tìm thấy sản phẩm");
      res.json(product);
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, price, description, brand, category, ingredients, skinType, stock, expiryDate, discount } = req.body;

      let image = "";
      if (req.file) {
        image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }

      const newProduct = await ProductService.createProduct({
        name,
        price,
        description,
        brand,
        image,
        category,
        ingredients,
        skinType,
        stock,
        expiryDate,
        discount,
      });

      res.status(201).json(newProduct);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const data = req.body;
      if (req.file) {
        data.image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }

      const updated = await ProductService.updateProduct(req.params.id, data);
      if (!updated) return res.status(404).send("Không tìm thấy sản phẩm");
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const deleted = await ProductService.deleteProduct(req.params.id);
      if (!deleted) return res.status(404).send("Không tìm thấy sản phẩm");
      res.json({ message: "Xóa thành công" });
    } catch (err) {
      next(err);
    }
  },
};
