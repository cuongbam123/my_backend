const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const setupChatAI = require("./chatAI");

// Load biến môi trường
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002", "https://hrucosmetics.kesug.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// ✅ Cấu hình middleware **trước khi gọi routes**
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3002",
    "https://hrucosmetics.kesug.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ✅ Xử lý preflight request (OPTIONS)
app.options("*", cors());
app.use(express.json()); // ✅ để đọc body JSON
app.use(express.urlencoded({ extended: true })); // ✅ để đọc form-data urlencoded
app.use('/uploads', express.static('uploads')); // ✅ phục vụ file ảnh upload tĩnh

// ✅ Kết nối MongoDB
mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// ✅ Khởi tạo Socket.IO (Chat AI)
setupChatAI(io);

// ✅ Import routes
const userRoutes = require("./routes/UserRoutes");
const productRoutes = require("./routes/ProductRoutes");
const orderRoutes = require("./routes/OrderRoutes");
const detailOrderRoutes = require("./routes/DetailOrderRoutes");
const uploadRoutes = require("./routes/UploadRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");
const couponRoutes = require("./routes/CouponRoutes");
const paypalRoutes = require("./routes/PaypalRoutes");
const categoryRoutes = require("./routes/CategoryRoutes")
const noteRoutes = require("./routes/NoteRoutes");

// ✅ Gắn routes
app.use((req, res, next) => {
  console.log("📥 GLOBAL LOG:", req.method, req.url, "Content-Type:", req.headers["content-type"]);
  next();
});
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/detail-orders", detailOrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/notes', noteRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Lỗi:", err);
  res.status(500).json({ error: err.message || "Lỗi server nội bộ" });
});

app.get("/", (req, res) => {
  res.send("✅ Backend server is running successfully!");
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

// ✅ Khởi động server
server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
