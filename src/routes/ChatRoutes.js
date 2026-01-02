const express = require("express");
const { sendMessage } = require("../controllers/ChatController");

const router = express.Router();
router.post("/chat", sendMessage);

module.exports = router;

// const express = require("express");
// const ChatController = require("../controllers/ChatController");

// const router = express.Router();

// router.post("/chat", ChatController.chat);

// module.exports = router;
