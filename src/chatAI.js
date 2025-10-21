const { getGeminiReply } = require("./services/chatService");

function setupChatAI(io) {
    io.on("connection", (socket) => {
        console.log("🟢 User connected:", socket.id);

        socket.on("send_message", async (message) => {
            try {
                const reply = await getGeminiReply(message);
                socket.emit("receive_message", reply);
            } catch (err) {
                socket.emit("receive_message", "Lỗi khi gọi Gemini API.");
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 User disconnected:", socket.id);
        });
    });
}

module.exports = setupChatAI;
