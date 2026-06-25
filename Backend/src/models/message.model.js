const mongoose=require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
    imageBase64: {
      type: String,
      default: null,
    },
    imageMimeType: {
      type: String,
      default: null,
    },
    images: [
      {
        base64: { type: String },
        mimeType: { type: String }
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports=Message;