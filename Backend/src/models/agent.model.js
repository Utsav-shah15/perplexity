const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      sparse: true, // sparse allowed since user-created agents won't have code
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    systemPrompt: {
      type: String,
      required: true,
    },
    tools: {
      type: [String],
      default: ["web_search"], // default to web_search
    },
    icon: {
      type: String,
      default: "🤖",
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for system agents
    },
  },
  {
    timestamps: true,
  }
);

const Agent = mongoose.model("Agent", agentSchema);
module.exports = Agent;
