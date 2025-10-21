const jwt = require("jsonwebtoken");
const User = require("../models/user"); // 👈 cần để kiểm tra role thật trong DB

// ✅ Kiểm tra token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Chưa đăng nhập hoặc thiếu token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Tìm user trong DB (đảm bảo tồn tại & có role chính xác)
    const user = await User.findById(decoded.id || decoded._id).select("id role email fullname");
    if (!user) {
      return res.status(403).json({ message: "Tài khoản không tồn tại hoặc token không hợp lệ" });
    }

    req.user = user; // Gán lại user thật có role
    next();
  } catch (err) {
    console.error("❌ verifyToken error:", err);
    return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// ✅ Kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
