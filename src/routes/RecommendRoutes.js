const express = require("express");
const router = express.Router();
const RecommendController = require("../controllers/RecommendController");

// log view (không bắt buộc login)
router.post("/products/:id/view", RecommendController.logProductView);

// recommend
router.get("/products/:id/recommend", RecommendController.recommend);

module.exports = router;
