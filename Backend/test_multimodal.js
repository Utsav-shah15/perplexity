require("dotenv").config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");

async function main() {
  try {
    console.log("Initializing Gemini model...");
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const imageMimeType = "image/png";

    const formatted = [
      new SystemMessage("You are a helpful assistant."),
      new HumanMessage("explain this image"),
      new AIMessage("Could you please clarify which image you're referring to? If you've uploaded an image, I'll analyze it right away."),
      new HumanMessage({
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${imageMimeType};base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: "explain this image",
          }
        ]
      })
    ];

    console.log("Streaming multimodal test with history...");
    const stream = await model.stream(formatted);

    for await (const chunk of stream) {
      console.log("Chunk content:", chunk.content);
    }
    console.log("Stream finished.");
  } catch (error) {
    console.error("Error occurred:", error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

main();
