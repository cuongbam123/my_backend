const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { verifyToken, isAdmin } = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname),
});

const upload = multer({ storage });

// Public
router.get("/", ProductController.index);
router.get("/:id", ProductController.show);

// Admin
router.post("/", verifyToken, isAdmin, upload.single("image"), ProductController.create);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), ProductController.update);
router.delete("/:id", verifyToken, isAdmin, ProductController.remove);

module.exports = router;
