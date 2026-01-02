const Product = require("../models/product");
const ChatSession = require("../models/ChatSession");
const OpenAIService = require("./OpenAIService");

class ChatService {
  constructor() {
    this.openai = new OpenAIService();
    this.maxHistory = 12;

    this.followUpTriggers = [
      "rẻ", "giá thấp", "loại nào rẻ",
      "so sánh", "khác nhau", "tốt hơn",
      "còn hàng", "tồn kho"
    ];

    this.vnProductKeywords = {
      sunscreen: ["chong nang", "sunscreen", "spf"],
      cleanser: ["rua mat", "cleanser"],
      toner: ["toner", "hoa hong", "nước tẩy trang", "tẩy trang", "tay trang"],
      serum: ["serum", "tinh chat"],
      moisturizer: ["duong am", "kem duong"],
      haircare: ["duong toc", "dau duong toc"],
    };
  }

  /* ================= UTIL ================= */

  normalize(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  detectSkinType(text) {
    const t = this.normalize(text);
    if (t.includes("da dau")) return "oily";
    if (t.includes("da kho")) return "dry";
    if (t.includes("nhay cam")) return "sensitive";
    if (t.includes("da thuong")) return "normal";
    return null;
  }

  detectPrice(text) {
    const t = this.normalize(text);
    const match = t.match(/(\d+)\s?(k|nghin|ngan)?/);
    if (!match) return null;
    return Number(match[1]) * 1000;
  }

  isFollowUp(text) {
    const t = this.normalize(text);
    return this.followUpTriggers.some(k => t.includes(k));
  }

  detectKeywords(text) {
    const t = this.normalize(text);
    for (const keywords of Object.values(this.vnProductKeywords)) {
      if (keywords.some(k => t.includes(k))) return keywords;
    }
    return [];
  }

  /* ================= SESSION ================= */

  async getOrCreateSession(sessionId) {
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({
        sessionId,
        messages: [],
        lastProducts: [],
      });
    }
    return session;
  }

  async pushMessage(session, role, content) {
    session.messages.push({ role, content });
    if (session.messages.length > this.maxHistory) {
      session.messages = session.messages.slice(-this.maxHistory);
    }
    await session.save();
  }

  /* ================= SEARCH ================= */

  async searchProductsByKeywords(keywords, skinType, maxPrice) {
    const regexList = keywords.map(k => new RegExp(k, "i"));

    const query = {
      $and: [
        {
          $or: [
            { name: { $in: regexList } },
            { description: { $in: regexList } },
            { brand: { $in: regexList } },
            { "category.name": { $in: regexList } },
          ],
        },
      ],
    };

    if (skinType) {
      query.$and.push({ $or: [{ skinType }, { skinType: "all" }] });
    }

    if (maxPrice) {
      query.$and.push({ price: { $lte: maxPrice } });
    }

    return Product.find(query).populate("category").limit(6);
  }

  detectCompareIntent(text) {
  const t = this.normalize(text);

  const compareKeywords = [
    "so sanh",
    "so sánh",
    "khac nhau",
    "khác nhau",
    "tot hon",
    "tốt hơn",
    "nen chon",
    "nên chọn",
    "loai nao hon",
    "loại nào hơn"
  ];

  return compareKeywords.some(k => t.includes(this.normalize(k)));
}


  /* ================= MAIN ================= */

  async handleChat({ sessionId, message }) {
    const session = await this.getOrCreateSession(sessionId);
    const userMsg = this.normalize(message);

    await this.pushMessage(session, "user", message);

    /* ===== FOLLOW-UP ===== */
    if (this.isFollowUp(userMsg) && session.lastProducts.length) {
      const products = await Product.find({
        _id: { $in: session.lastProducts },
      });

      if (userMsg.includes("re")) {
        products.sort((a, b) => a.price - b.price);
      }

      const list = products.map(
        (p, i) => `${i + 1}. ${p.name} — ${p.price.toLocaleString()}đ`
      ).join("\n");

      const reply = `Mình so sánh nhanh cho bạn nè 😊\n\n${list}`;
      await this.pushMessage(session, "assistant", reply);

      return { reply, productsFound: products.length };
    }

    /* ===== SEARCH MỚI ===== */
    const skinType = this.detectSkinType(userMsg);
    const maxPrice = this.detectPrice(userMsg);
    const keywords = this.detectKeywords(userMsg);

    if (!keywords.length) {
      const reply =
        "Bạn cho mình biết rõ hơn một chút nha 😊 Ví dụ: *kem chống nắng cho da dầu dưới 300k*";
      await this.pushMessage(session, "assistant", reply);
      return { reply, productsFound: 0 };
    }

    const products = await this.searchProductsByKeywords(
      keywords,
      skinType,
      maxPrice
    );

    if (!products.length) {
      const reply =
        "Mình chưa tìm được sản phẩm phù hợp hoàn toàn 😥 Bạn thử nới rộng ngân sách hoặc cho mình biết loại da nhé!";
      await this.pushMessage(session, "assistant", reply);
      return { reply, productsFound: 0 };
    }

    // ⭐ lưu ngữ cảnh
    session.lastProducts = products.map(p => p._id);
    await session.save();

    const list = products.map(
      (p, i) => `${i + 1}. ${p.name} — ${p.price.toLocaleString()}đ`
    ).join("\n");

    const reply = `✨ Mình gợi ý cho bạn nè:\n\n${list}\n\nBạn muốn **so sánh**, **lọc giá rẻ hơn**, hay **xem loại bán chạy** không? 😊`;

    await this.pushMessage(session, "assistant", reply);

    return { reply, productsFound: products.length };
  }
}

module.exports = ChatService;


// const Product = require("../models/product");
// const RecommendService = require("./RecommendService");
// const OpenAIService = require("./OpenAIService");

// class ChatService {
//   async handleMessage({ message, userId, productId }) {

//     // 1️⃣ GPT phân tích ý định
//     const intentData = await OpenAIService.detectIntent(message);

//     // ================= CHAT THƯỜNG =================
//     if (intentData.intent === "chat") {
//       const reply = await OpenAIService.normalChat(message);
//       return {
//         type: "chat",
//         message: reply
//       };
//     }

//     // ================= TƯ VẤN / TÌM SẢN PHẨM =================
//     if (intentData.intent === "advice" || intentData.intent === "find") {

//       let products = [];

//       // Nếu user đang xem 1 sản phẩm → dùng recommendation
//       if (productId) {
//         products = await RecommendService.recommendMixed(productId, 5);
//       }

//       // Nếu chưa có hoặc không đủ → tìm theo nhu cầu
//       if (!products.length) {
//         products = await this.findProducts(intentData);
//       }

//       if (!products.length) {
//         return {
//           type: "chat",
//           message: "Hiện shop chưa có sản phẩm phù hợp với nhu cầu của bạn 😥"
//         };
//       }

//       // GPT chỉ được phép nói dựa trên products này
//       const answer = await OpenAIService.productAdvice({
//         userMessage: message,
//         products
//       });

//       return {
//         type: "product_advice",
//         message: answer,
//         products
//       };
//     }

//     // ================= SO SÁNH =================
//     if (intentData.intent === "compare") {
//       const products = await this.findProducts(intentData);

//       if (products.length < 2) {
//         return {
//           type: "chat",
//           message: "Mình chưa tìm đủ sản phẩm để so sánh cho bạn 😥"
//         };
//       }

//       const reply = await OpenAIService.compareProducts({
//         userMessage: message,
//         products
//       });

//       return {
//         type: "compare",
//         message: reply,
//         products
//       };
//     }

//     // ================= FALLBACK =================
//     return {
//       type: "chat",
//       message: "Mình chưa hiểu rõ ý bạn, bạn nói lại giúp mình nha 😊"
//     };
//   }

//   // ===== TÌM SẢN PHẨM TỪ DB =====
//   async findProducts({ skinType, budget, keywords }) {
//     const query = {};

//     if (skinType) {
//       query.skinType = { $regex: skinType, $options: "i" };
//     }

//     if (budget) {
//       query.price = { $lte: budget };
//     }

//     if (keywords?.length) {
//       query.name = { $regex: keywords.join("|"), $options: "i" };
//     }

//     return Product.find(query).limit(5).lean();
//   }
// }

// module.exports = new ChatService();
