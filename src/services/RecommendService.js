const mongoose = require("mongoose");
const Product = require("../models/product");
const Category = require("../models/category");
const ProductView = require("../models/ProductView");

class RecommendService {
  // ====== LOG VIEW ======
  async logView({ productId, userId, sessionId, ip, userAgent }) {
    if (!mongoose.Types.ObjectId.isValid(productId)) return null;

    return ProductView.create({
      user_id: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
      product_id: productId,
      session_id: sessionId || undefined,
      ip: ip || undefined,
      user_agent: userAgent || undefined,
    });
  }

  // ====== CONTENT-BASED ======
  async recommendByContent(productId, limit = 8) {
    if (!mongoose.Types.ObjectId.isValid(productId)) return [];

    const product = await Product.findById(productId).lean();
    if (!product) return [];

    // lấy tên category để tăng độ liên quan (vì category là ObjectId)
    let categoryName = "";
    if (product.category) {
      const cat = await Category.findById(product.category).lean();
      categoryName = cat?.name || "";
    }

    // token đơn giản từ name/brand/ingredients
    const tokens = this._toTokens([
      product.name,
      product.brand,
      product.ingredients,
      categoryName,
      product.skinType
    ]);

    // query content-based: ưu tiên cùng category/skinType/brand + trùng token trong name
    // (tags nếu có)
    const orConds = [
      { category: product.category },
      { skinType: product.skinType },
      ...(product.brand ? [{ brand: product.brand }] : []),
      ...(product.tags?.length ? [{ tags: { $in: product.tags } }] : []),
    ];

    // thêm regex theo token (để bắt “tên tương tự”)
    // giới hạn token để tránh regex quá nặng
    const topTokens = tokens.slice(0, 6);
    for (const t of topTokens) {
      orConds.push({ name: { $regex: t, $options: "i" } });
    }

    const results = await Product.find({
      _id: { $ne: product._id },
      $or: orConds,
    })
      .limit(limit * 3) // lấy dư để chấm điểm
      .lean();

    // chấm điểm đơn giản để sort “đúng nhất”
    const scored = results
      .map((p) => ({ p, score: this._scoreContent(product, p, tokens) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.p);

    return scored;
  }

  _scoreContent(base, cand, baseTokens) {
    let s = 0;

    if (String(cand.category) === String(base.category)) s += 5;
    if (cand.skinType && base.skinType && cand.skinType === base.skinType) s += 2;
    if (cand.brand && base.brand && cand.brand === base.brand) s += 2;

    // tags nếu có
    if (Array.isArray(base.tags) && Array.isArray(cand.tags) && base.tags.length && cand.tags.length) {
      const set = new Set(base.tags.map(x => String(x).toLowerCase()));
      const hit = cand.tags.filter(x => set.has(String(x).toLowerCase())).length;
      s += Math.min(hit, 4);
    }

    // token overlap trong name/ingredients/description
    const text = this._toText([cand.name, cand.ingredients, cand.description, cand.brand]);
    let hit = 0;
    for (const t of baseTokens.slice(0, 10)) {
      if (t.length >= 3 && text.includes(t)) hit++;
    }
    s += Math.min(hit, 6);

    // gần giá (khuyến nghị nhẹ)
    if (typeof base.price === "number" && typeof cand.price === "number") {
      const diff = Math.abs(base.price - cand.price);
      if (diff <= 50000) s += 1;
      else if (diff <= 150000) s += 0.5;
    }

    return s;
  }

  // ====== CO-VIEW (“cũng xem”) ======
  async recommendByCoView(productId, limit = 8, days = 30) {
    if (!mongoose.Types.ObjectId.isValid(productId)) return [];

    const pid = new mongoose.Types.ObjectId(productId);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // 1) tìm viewers (user_id hoặc session_id) đã xem productId gần đây
    const viewers = await ProductView.aggregate([
      { $match: { product_id: pid, createdAt: { $gte: since } } },
      {
        $project: {
          viewerKey: {
            $ifNull: ["$user_id", "$session_id"]
          }
        }
      },
      { $match: { viewerKey: { $ne: null } } },
      { $group: { _id: "$viewerKey" } },
      { $limit: 5000 }
    ]);

    const viewerKeys = viewers.map(v => v._id);
    if (!viewerKeys.length) return [];

    // 2) các sản phẩm mà các viewer đó cũng xem (trừ productId)
    const recs = await ProductView.aggregate([
      {
        $match: {
          createdAt: { $gte: since },
          product_id: { $ne: pid },
        }
      },
      {
        $addFields: {
          viewerKey: { $ifNull: ["$user_id", "$session_id"] }
        }
      },
      { $match: { viewerKey: { $in: viewerKeys } } },
      {
        $group: {
          _id: "$product_id",
          count: { $sum: 1 },
          lastSeen: { $max: "$createdAt" }
        }
      },
      { $sort: { count: -1, lastSeen: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $replaceRoot: { newRoot: "$product" } }
    ]);

    return recs;
  }

  // ====== MIX ======
  async recommendMixed(productId, limit = 8) {
    // chia tỉ lệ: coview mạnh hơn nếu đủ data
    const coview = await this.recommendByCoView(productId, Math.ceil(limit * 0.6));
    const need = limit - coview.length;
    const content = need > 0 ? await this.recommendByContent(productId, need + 4) : [];

    // merge unique
    const seen = new Set([String(productId)]);
    const merged = [];

    for (const p of coview) {
      const id = String(p._id);
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(p);
      }
      if (merged.length >= limit) return merged;
    }

    for (const p of content) {
      const id = String(p._id);
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(p);
      }
      if (merged.length >= limit) break;
    }

    return merged;
  }

  // ===== helpers =====
  _toText(arr) {
    return arr
      .filter(Boolean)
      .map(x => String(x).toLowerCase())
      .join(" ");
  }

  _toTokens(arr) {
    const text = this._toText(arr);
    const raw = text
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map(t => t.trim());

    // unique + bỏ token quá ngắn
    const uniq = [];
    const set = new Set();
    for (const t of raw) {
      if (t.length < 2) continue;
      if (!set.has(t)) {
        set.add(t);
        uniq.push(t);
      }
    }
    return uniq;
  }
}

module.exports = new RecommendService();
