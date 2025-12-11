const axios = require("axios");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiURL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  }

  // Delay
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Gửi request với retry
  async requestGemini(prompt) {
    let retries = 5;

    for (let i = 0; i < retries; i++) {
      try {
        const res = await axios.post(
          `${this.apiURL}?key=${this.apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        return (
          res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Mình không nhận được phản hồi, bạn thử lại giúp mình nhé!"
        );
      } catch (err) {
        const code = err?.response?.status;

        console.log(`Gemini Error: ${code}`);

        // Nếu bị rate-limit
        if (code === 429) {
          console.log(`⏳ Gemini đang quá tải -> Retry (${i + 1})`);

          await this.sleep(500 * (i + 1)); // tăng delay dần
          continue;
        }

        // Nếu lỗi khác → break
        break;
      }
    }

    // Nếu retry thất bại hết thì trả lời fallback
    return "Xin lỗi bạn, hệ thống AI đang quá tải. Bạn có thể thử lại trong giây lát nhé 💖";
  }
}

module.exports = GeminiService;
