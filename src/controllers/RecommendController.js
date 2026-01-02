const RecommendService = require("../services/RecommendService");

class RecommendController {
  async logProductView(req, res) {
    try {
      const productId = req.params.id;

      // nếu bạn có auth middleware thì req.user sẽ có
      const userId = req.user?._id;

      // session cho khách vãng lai (FE tự set cookie/localStorage rồi gửi lên cũng được)
      const sessionId = req.headers["x-session-id"];

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress;

      const userAgent = req.headers["user-agent"];

      await RecommendService.logView({ productId, userId, sessionId, ip, userAgent });
      return res.json({ message: "logged" });
    } catch (err) {
      console.error("logProductView error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async recommend(req, res) {
    try {
      const productId = req.params.id;
      const limit = Math.min(parseInt(req.query.limit || "8", 10), 30);
      const mode = (req.query.mode || "mixed").toLowerCase();

      let data = [];
      if (mode === "content") {
        data = await RecommendService.recommendByContent(productId, limit);
      } else if (mode === "coview") {
        data = await RecommendService.recommendByCoView(productId, limit);
      } else {
        data = await RecommendService.recommendMixed(productId, limit);
      }

      return res.json({ items: data });
    } catch (err) {
      console.error("recommend error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new RecommendController();
