// index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const setupChatAI = require("./chatAI");

// 🧩 Load biến môi trường
dotenv.config();

const app = express();
const server = http.createServer(app);

// 🧩 Cấu hình Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "https://hrucosmetics.kesug.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// 🧩 Cấu hình CORS & middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "https://hrucosmetics.kesug.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🧩 Cấu hình phục vụ ảnh tĩnh (uploads)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 🧩 Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// 🧩 Khởi tạo Chat AI
setupChatAI(io);

// 🧩 Import routes
const userRoutes = require("./routes/UserRoutes");
const productRoutes = require("./routes/ProductRoutes");
const orderRoutes = require("./routes/OrderRoutes");
const detailOrderRoutes = require("./routes/DetailOrderRoutes");
const uploadRoutes = require("./routes/UploadRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");
const couponRoutes = require("./routes/CouponRoutes");
const paypalRoutes = require("./routes/PaypalRoutes");
const categoryRoutes = require("./routes/CategoryRoutes");
const noteRoutes = require("./routes/NoteRoutes");

// 🧩 Log request toàn cục
app.use((req, res, next) => {
  console.log("📥 GLOBAL LOG:", req.method, req.url, "Content-Type:", req.headers["content-type"]);
  next();
});

// 🧩 Gắn routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/detail-orders", detailOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notes", noteRoutes);

// 🧩 Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Lỗi:", err);
  res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
});

// 🧩 Route mặc định
app.get("/", (req, res) => {
  res.send("✅ Backend server is running successfully!");
});

// 🧩 Bắt lỗi không mong muốn
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

// 🧩 Khởi động server
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
