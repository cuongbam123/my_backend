// index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ---------------------- MIDDLEWARE ---------------------- */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3002",
    "https://hrucosmetics.kesug.com",
    "https://hrucosmeticsadmin.lovestoblog.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Serve static uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


/* ---------------------- DATABASE ---------------------- */
mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

/* ---------------------- ROUTES ---------------------- */
app.use("/api/users", require("./routes/UserRoutes"));
app.use("/api/products", require("./routes/ProductRoutes"));
app.use("/api/orders", require("./routes/OrderRoutes"));
app.use("/api/detail-orders", require("./routes/DetailOrderRoutes"));
app.use("/api/upload", require("./routes/UploadRoutes"));
app.use("/api/payments", require("./routes/PaymentRoutes"));
app.use("/api/coupons", require("./routes/CouponRoutes"));
app.use("/api/paypal", require("./routes/PaypalRoutes"));
app.use("/api/categories", require("./routes/CategoryRoutes"));
app.use("/api/notes", require("./routes/NoteRoutes"));
app.use("/api", require("./routes/RecommendRoutes"));


/* ---------------------- CHAT AI ROUTE ---------------------- */
// const chatRoute = require("./routes/ChatRoutes");
const chatRoutes = require("./routes/ChatRoutes");
app.use("/api", chatRoutes);

/* ---------------------- DEFAULT ---------------------- */
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

/* ---------------------- ERROR HANDLER ---------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

/* ---------------------- START SERVER ---------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
