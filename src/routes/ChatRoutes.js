const express = require("express");
const { handleChat } = require("../controllers/ChatController");

const router = express.Router();

router.post("/", handleChat);

module.exports = router;
