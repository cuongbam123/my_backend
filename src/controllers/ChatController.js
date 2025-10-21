const { getGeminiReply } = require("../services/ChatService");

async function handleChat(req, res) {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Vui lòng cung cấp message." });
        }

        const reply = await getGeminiReply(message);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: error.message || "Lỗi server." });
    }
}

module.exports = { handleChat };
