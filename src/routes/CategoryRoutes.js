const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// Public
router.get("/", CategoryController.index);
router.get("/:id", CategoryController.show);

// Admin
router.post("/", verifyToken, isAdmin, CategoryController.create);
router.put("/:id", verifyToken, isAdmin, CategoryController.update);
router.delete("/:id", verifyToken, isAdmin, CategoryController.remove);

module.exports = router;
