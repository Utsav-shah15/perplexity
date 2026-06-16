require("dotenv").config();

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatMistralAI } = require("@langchain/mistralai");
const { HumanMessage, SystemMessage, AIMessage } = require("@langchain/core/messages");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { searchInternet } = require("./internet.service");
const { searchKnowledgeBase } = require("./rag.service");

// Models
const geminimodel = new ChatGoogleGenerativeAI({
  model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const mistralmodel = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-small-latest",
});

// Tools
const searchInternetTool = tool(
  searchInternet,
  {
    name: "searchInternet",
    description:
      "Use this tool to search the internet for information related to the user's query. " +
      "Use it for recent news, current events, facts, or any information not in training data.",
    schema: z.object({
      query: z.string().describe("The search query provided by the user."),
    }),
  }
);


// Create a knowledge base tool scoped to a specific user.
function createKnowledgeBaseTool(userId) {
  return tool(
    async ({ query }) => searchKnowledgeBase({ query, userId }),
    {
      name: "searchKnowledgeBase",
      description:
        "Search the user's personal Knowledge Base (uploaded documents like PDFs, CSVs, TXTs). " +
        "Use this tool when the user asks about their uploaded files or personal documents.",
      schema: z.object({
        query: z.string().describe("The query to search in the knowledge base."),
      }),
    }
  );
}

// Agent
const agent = createReactAgent({
  llm: geminimodel,
  tools: [searchInternetTool],
});


//Build an agent with both internet search + knowledge base tools.
function createAgentWithKB(userId) {
  return createReactAgent({
    llm: geminimodel,
    tools: [searchInternetTool, createKnowledgeBaseTool(userId)],
  });
}

// Functions

// Non-streaming response (HTTP fallback)
async function generateResponse(messages, userId = null) {
  const formatted = messages.map((msg) => {
    if (msg.role === "user") return new HumanMessage(msg.content);
    return new AIMessage(msg.content);
  });

  const activeAgent = userId ? createAgentWithKB(userId) : agent;
  const res = await activeAgent.invoke({ messages: formatted });
  const lastMsg = res.messages[res.messages.length - 1];
  return lastMsg.content;
}

// Streaming generator — yields LangGraph streamEvents chunks
// Used by Socket.io server for real-time streaming
async function* streamResponse(messages, userId = null) {
  const formatted = messages.map((msg) => {
    if (msg.role === "user") return new HumanMessage(msg.content);
    return new AIMessage(msg.content);
  });

  const activeAgent = userId ? createAgentWithKB(userId) : agent;

  const eventStream = activeAgent.streamEvents(
    { messages: formatted },
    { version: "v2" }
  );

  for await (const chunk of eventStream) {
    yield chunk;
  }
}


// Generate a short chat title using Mistral
async function generateTitleResponse(message) {
  const res = await mistralmodel.invoke([
    new SystemMessage(`
      You are an AI assistant.

      Your task is to generate a short and meaningful chat title based on the user's message.

      Rules:
      - Generate only the title
      - Keep it under 6 words
      - Do not use quotes
      - Do not use emojis
      - Make the title concise and relevant
      - Return plain text only

      Examples:
      User: Explain blockchain technology
      Title: Blockchain Basics

      User: Create React login page
      Title: React Login Page

      User: How to learn Spring Boot
      Title: Spring Boot Guide
    `),
    new HumanMessage(message),
  ]);

  return res.content;
}

module.exports = {
  generateResponse,
  streamResponse,
  generateTitleResponse,
};