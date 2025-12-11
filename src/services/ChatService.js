const Product = require("../models/product");
const GeminiService = require("./GeminiService");

class ChatService {
  constructor() {
    this.gemini = new GeminiService();

    // Các từ khóa để nhận biết chào hỏi
    this.greetings = ["hi", "hello", "helo", "chào", "xin chào", "hiii", "alo", "tôi cần tư vấn"];
    
    // Từ khóa liên quan sản phẩm
    this.productKeywords = [
      "trị", "mụn", "nám", "dưỡng tóc", "sữa rửa mặt", "tóc", "da", "kem chống nắng", "serum", "son",
      "dầu", "tẩy", "nước hoa", "makeup", "nước dưỡng"
    ];
  }

  // 🔍 Kiểm tra câu có phải lời chào
  isGreeting(text) {
    return this.greetings.includes(text.trim().toLowerCase());
  }

  // 🔍 Kiểm tra câu có phải là câu hỏi về sản phẩm
  isProductIntent(text) {
    const lower = text.toLowerCase();
    return this.productKeywords.some((k) => lower.includes(k));
  }

  // 🔍 Tìm sản phẩm
  // 🔍 Tìm sản phẩm thông minh hơn
async searchProducts(text) {
  const lower = text.toLowerCase();

  // Mapping các từ khoá → nhóm sản phẩm tương ứng
  const intentMap = [
    { keywords: ["kem chống nắng", "chống nắng", "sunscreen", "spf"], category: "Kem chống nắng" },
    { keywords: ["mụn", "trị mụn", "mụn viêm"], category: "Trị mụn" },
    { keywords: ["dưỡng tóc", "tóc khô", "rụng tóc"], category: "Dưỡng tóc" },
    { keywords: ["serum", "tinh chất"], category: "Serum" },
    { keywords: ["makeup", "trang điểm"], category: "Trang điểm" },
  ];

  // 1) Tìm nhóm sản phẩm theo từ khoá intent
  const matchedIntent = intentMap.find(intent =>
    intent.keywords.some(k => lower.includes(k))
  );

  // Nếu khớp → tìm theo danh mục trước (ưu tiên)
  if (matchedIntent) {
    const productsByCategory = await Product.find()
      .populate("category")
      .then(all =>
        all.filter(p =>
          p.category?.name?.toLowerCase() === matchedIntent.category.toLowerCase()
        )
      );

    if (productsByCategory.length > 0) {
      return productsByCategory;
    }
  }

  // 2) Nếu không → fallback: tìm theo tên / mô tả
  const regex = new RegExp(text, "i");
  let products = await Product.find({
    $or: [{ name: regex }, { description: regex }]
  }).populate("category");

  // 3) Thử dò theo category name (không strict)
  if (products.length === 0) {
    const all = await Product.find().populate("category");
    products = all.filter(p =>
      p.category?.name?.toLowerCase().includes(lower)
    );
  }

  return products;
}


  // 🧠 Gọi AI để viết lại công dụng đẹp hơn – KHÔNG đọc mô tả gốc
  async generateUsageForMultipleProducts(products) {
  try {
    const list = products
      .map((p, i) => `${i+1}. ${p.name} (Danh mục: ${p.category?.name})`)
      .join("\n");

    const prompt = `
Bạn là chuyên gia mỹ phẩm.

Hãy mô tả công dụng NGẮN GỌN cho từng sản phẩm dưới đây.
Trả về đúng format sau:

1. Công dụng viết gọn 1–2 câu
2. Công dụng viết gọn 1–2 câu
...

DANH SÁCH SẢN PHẨM:
${list}
`;

    const aiResponse = await this.gemini.requestGemini(prompt);
    return aiResponse.split("\n").filter(x => x.trim());
  } 
  catch (err) {
    console.error("Gemini Summary Error:", err);
    return products.map(p => "Công dụng: Sản phẩm giúp chăm sóc và cải thiện hiệu quả.");
  }
}


  // Format trả lời sản phẩm
  async formatProducts(products) {
  const usages = await this.generateUsageForMultipleProducts(products);

  let result = "";

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const usage = usages[i] || "Cung cấp công dụng chăm sóc cơ bản.";

    result += `✨ *${p.name}*\n`
      + `💰 Giá: ${p.price.toLocaleString()}đ\n`
      + `🏷 Danh mục: ${p.category?.name}\n`
      + `📌 Công dụng: ${usage}\n\n`;
  }

  return result.trim();
}

  // MAIN CHAT LOGIC
  async handleChat(message) {
    try {
      const userMsg = message.trim();

      // ===============================
      // 1) Lời chào
      // ===============================
      if (this.isGreeting(userMsg)) {
        return "Xin chào bạn 👋!\nMình là trợ lý của HruCosmetics. Bạn muốn tìm sản phẩm theo nhu cầu nào ạ?";
      }

      // ===============================
      // 2) Câu liên quan sản phẩm
      // ===============================
      if (this.isProductIntent(userMsg)) {
        const products = await this.searchProducts(userMsg);

        if (products.length === 0) {
          return "Hiện tại mình chưa tìm thấy sản phẩm phù hợp 😥. Bạn có thể mô tả rõ hơn không?";
        }

        // Chỉ trả kết quả đầy đủ (nhưng không bao giờ trả ảnh)
        return await this.formatProducts(products);
      }

      // ===============================
      // 3) Không phải sản phẩm → hỏi AI
      // ===============================
      const aiReply = await this.gemini.requestGemini(`
User: "${userMsg}"
Hãy trả lời thân thiện như người thật.
`);

      return aiReply;

    } catch (err) {
      console.error("ChatService Error:", err);
      return "❌ Xin lỗi, hệ thống đang gặp lỗi. Bạn thử lại giúp mình nhé!";
    }
  }
}

module.exports = ChatService;
