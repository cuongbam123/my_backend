const mongoose = require("mongoose");

const MsgSchema = new mongoose.Schema(
  { role: { type: String, enum: ["user", "assistant"], required: true }, content: { type: String, required: true } },
  { timestamps: true }
);

const ChatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: { type: [MsgSchema], default: [] },

    // ✅ chống duplicate request
    lastClientMsgId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", ChatSessionSchema);
