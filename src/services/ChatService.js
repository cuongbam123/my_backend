const axios = require("axios");

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

async function getGeminiReply(userMessage) {
    try {
        const systemInstruction =
            "Bạn là một nhân viên tư vấn bán hàng chuyên nghiệp tại cửa hàng thiết bị điện tử Electronic Shop. " +
            "Bạn chỉ trả lời các câu hỏi liên quan đến thiết bị điện tử như điện thoại, laptop, máy tính bảng, loa, tai nghe. " +
            "Bạn phải trả lời chi tiết, thân thiện, cung cấp thông tin như tính năng, ưu nhược điểm, giá tham khảo, chương trình khuyến mãi (nếu có). " +
            "Nếu câu hỏi không liên quan thiết bị điện tử, hãy trả lời: 'Xin lỗi, tôi chỉ hỗ trợ tư vấn các sản phẩm thiết bị điện tử tại Electronic Shop.' " +
            "Bạn tuyệt đối không được nhắc đến bất kỳ cửa hàng hay thương hiệu nào khác ngoài Electronic Shop.";


        const contents = [
            {
                role: "user",
                parts: [{ text: `${systemInstruction}\n\nCâu hỏi của khách hàng: ${userMessage}` }]
            }
        ];

        const result = await axios.post(API_URL, { contents }, {
            headers: { "Content-Type": "application/json" },
        });

        const reply = result.data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi.";
        return reply;
    } catch (err) {
        console.error("❌ Lỗi gọi Gemini:", err.message);
        throw new Error("Lỗi khi gọi Gemini API.");
    }
}

module.exports = { getGeminiReply };