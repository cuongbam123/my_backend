// services/OpenAIService.js
const axios = require("axios");

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    const modelsEnv = process.env.OPENAI_MODELS_FALLBACK || process.env.OPENAI_MODEL || "gpt-4o-mini,gpt-3.5-turbo";
    this.models = modelsEnv.split(",").map(s => s.trim()).filter(Boolean);
    this.base = "https://api.openai.com/v1";
    this.timeout = 20000;
  }

  async requestOpenAI(prompt) {
    // prompt: a plain string prompt (we'll call chat/completions with a system+user)
    for (const model of this.models) {
      try {
        const url = `${this.base}/chat/completions`;
        const body = {
          model,
          messages: [
            { role: "system", content: "Bạn là một tư vấn viên mỹ phẩm thân thiện, ngắn gọn, KHÔNG BAO GIỜ bịa tên/giá/chi tiết sản phẩm nếu sản phẩm đó không có trong danh sách DB mà user cung cấp." },
            { role: "user", content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
        };

        const res = await axios.post(url, body, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: this.timeout,
        });

        const text = res.data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
        return null;
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data || err.message;
        console.error(`❌ OpenAI Error model=${model}:`, data);

        // nếu model không tồn tại -> thử model khác
        if (status === 404) continue;

        // 503/429 -> AI đang quá tải -> fallback (trả null để ChatService xử lý)
        if (status === 429 || status === 503) return null;

        // với lỗi khác (4xx/5xx) ta cũng trả null để không làm hỏng luồng
        return null;
      }
    }
    return null;
  }
}

module.exports = OpenAIService;
