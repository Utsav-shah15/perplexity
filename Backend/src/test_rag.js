const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { searchKnowledgeBase } = require("./services/rag.service");

async function run() {
  console.log("URI:", process.env.MONGO_URI);
  console.log("API Key:", process.env.GOOGLE_API_KEY);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  try {
    const res = await searchKnowledgeBase({
      query: "resume",
      userId: "6a0c52bdd30e7976982afb25",
      workspaceId: null,
    });
    console.log("Result:", res);
  } catch (err) {
    console.error("Error calling searchKnowledgeBase:", err);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
