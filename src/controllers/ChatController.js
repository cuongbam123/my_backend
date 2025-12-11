const ChatService = require("../services/ChatService");
const chatService = new ChatService();

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await chatService.handleChat(message);

    res.json({ reply });
  } catch (error) {
    console.error("ChatController Error:", error);
    res.status(500).json({ reply: "❌ Lỗi server!" });
  }
};
