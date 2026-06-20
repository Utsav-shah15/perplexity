const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "editor", "viewer"],
          default: "viewer",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    customInstructions: {
      type: String,
      default: "",
    },

    deployedAgents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
      },
    ],

    color: {
      type: String,
      default: "#9d89ff",
    },

    icon: {
      type: String,
      default: "💼",
    },
  },
  {
    timestamps: true,
  }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = Workspace;
