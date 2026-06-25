require("dotenv").config();
const connectDB = require("./src/config/database");
const Message = require("./src/models/message.model");
const Chat = require("./src/models/chat.model");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

async function main() {
  try {
    await connectDB();
    console.log("Connected to DB.");

    // Find the latest user message with imageBase64
    const userMsg = await Message.findOne({ imageBase64: { $ne: null } }).sort({ createdAt: -1 });
    if (!userMsg) {
      console.log("No user messages with images found in DB.");
      process.exit(1);
    }

    console.log("Found user message ID:", userMsg._id);
    console.log("Mime type:", userMsg.imageMimeType);
    console.log("Base64 length:", userMsg.imageBase64.length);

    console.log("Initializing Gemini model...");
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Custom system prompt for vision without tool-calling instructions
    const realSystemPrompt = "You are Aura Assistant, a highly helpful, intelligent, and general-purpose conversational assistant. Analyze the provided image and answer the user's query about it precisely and efficiently. Maintain a professional, friendly, and structured communication style.";

    const formatted = [
      new SystemMessage(realSystemPrompt),
      new HumanMessage({
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${userMsg.imageMimeType};base64,${userMsg.imageBase64}`,
            },
          },
          {
            type: "text",
            text: userMsg.content || "explain this image",
          }
        ]
      })
    ];

    console.log("Calling model.stream() with safe system prompt...");
    const stream = await model.stream(formatted);

    for await (const chunk of stream) {
      console.log("Chunk content:", chunk.content);
    }
    console.log("Done streaming successfully!");
  } catch (error) {
    console.error("DIAGNOSTIC ERROR caught:");
    console.error(error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
  process.exit(0);
}

main();
