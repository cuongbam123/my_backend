const ChatService = require("../services/ChatService");
const chatService = new ChatService();

exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId, clientMsgId } = req.body;

    // ✅ chặn request rỗng từ FE (ngăn Products found: 0)
    if (!message || !String(message).trim()) {
      return res.json({ reply: "Bạn nhập nội dung giúp mình nhé 😊", productsFound: 0 });
    }

    const result = await chatService.handleChat({
      sessionId,
      message,
      clientMsgId,
    });

    return res.json(result);
  } catch (error) {
    console.error("ChatController Error:", error);
    return res.status(500).json({ reply: "❌ Lỗi server!" });
  }
};

// const ChatService = require("../services/ChatService");

// class ChatController {
//   async chat(req, res) {
//     try {
//       const { message, productId } = req.body;

//       if (!message) {
//         return res.status(400).json({ message: "Message is required" });
//       }

//       const userId = req.user?._id || null;

//       const result = await ChatService.handleMessage({
//         message,
//         userId,
//         productId
//       });

//       return res.json(result);
//     } catch (err) {
//       console.error("Chat error:", err);
//       return res.status(500).json({ message: "Server error" });
//     }
//   }
// }

// module.exports = new ChatController();
