require("dotenv").config();
const connectDB = require("./src/config/database");
const Message = require("./src/models/message.model");
const Chat = require("./src/models/chat.model");

async function main() {
  await connectDB();
  console.log("Connected to DB.");

  // Get the most recent chat
  const latestChat = await Chat.findOne().sort({ updatedAt: -1 });
  if (!latestChat) {
    console.log("No chats found.");
    process.exit(0);
  }

  console.log("Latest Chat ID:", latestChat._id);
  console.log("Latest Chat Title:", latestChat.title);

  // Get all messages in this chat
  const messages = await Message.find({ chat: latestChat._id }).sort({ createdAt: 1 });
  console.log(`Found ${messages.length} messages:`);
  for (const msg of messages) {
    console.log(`--- [${msg.role.toUpperCase()}] ---`);
    console.log("Content:", msg.content);
    if (msg.imageBase64) {
      console.log("Image Mime:", msg.imageMimeType);
      console.log("Image Base64 length:", msg.imageBase64.length);
    }
  }

  process.exit(0);
}

main();
