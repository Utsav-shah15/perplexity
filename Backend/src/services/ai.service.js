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
  streaming: true,
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


// Create a knowledge base tool scoped to a specific user and workspace.
function createKnowledgeBaseTool(userId, workspaceId) {
  return tool(
    async ({ query }) => searchKnowledgeBase({ query, userId, workspaceId }),
    {
      name: "searchKnowledgeBase",
      description:
        "Search the user's Knowledge Base (uploaded documents like PDFs, CSVs, TXTs). " +
        "Use this tool when the user asks about their uploaded files or documents.",
      schema: z.object({
        query: z.string().describe("The query to search in the knowledge base."),
      }),
    }
  );
}

// Agent
const agent = createReactAgent({
  llm: mistralmodel,
  tools: [searchInternetTool],
});


// Build a dynamic agent with tools specified by agentConfig (e.g. web_search, knowledge_base).
function createDynamicAgent(userId, workspaceId, agentConfig = {}) {
  const tools = [];
  const enabledTools = agentConfig.tools || ["web_search", "knowledge_base"];

  if (enabledTools.includes("web_search")) {
    tools.push(searchInternetTool);
  }
  if (enabledTools.includes("knowledge_base") && userId) {
    tools.push(createKnowledgeBaseTool(userId, workspaceId));
  }

  return createReactAgent({
    llm: mistralmodel,
    tools: tools,
  });
}

// Functions

// non-streaming response
async function generateResponse(messages, userId = null, workspaceConfig = {}, agentConfig = {}) {
  const formatted = messages.map((msg) => {
    if (msg.role === "user") return new HumanMessage(msg.content);
    return new AIMessage(msg.content);
  });

  // Combine agent system prompt and custom workspace instructions
  let combinedSystemPrompt = (agentConfig && agentConfig.systemPrompt) || "You are Aura Assistant, a highly helpful, intelligent, and general-purpose conversational assistant. You have access to Web Search and Knowledge Base tools to help users answer their queries precisely and efficiently. When the user mentions or asks about an uploaded file, document, resume, or photo (e.g. using phrases like 'explain this photo', 'what is this image', 'show my file', etc.), you MUST immediately call the searchKnowledgeBase tool to retrieve its contents or visual descriptions. Do NOT ask the user for clarification before calling the searchKnowledgeBase tool. Maintain a professional, friendly, and structured communication style.";
  if (workspaceConfig.customInstructions) {
    combinedSystemPrompt += (combinedSystemPrompt ? "\n\n" : "") + `Workspace Guidelines:\n${workspaceConfig.customInstructions}`;
  }

  if (combinedSystemPrompt) {
    formatted.unshift(new SystemMessage(combinedSystemPrompt));
  }

  const activeAgent = userId
    ? createDynamicAgent(userId, workspaceConfig.workspaceId, agentConfig)
    : agent;

  const res = await activeAgent.invoke({ messages: formatted });
  const lastMsg = res.messages[res.messages.length - 1];
  return lastMsg.content;
}

// streaming response
async function* streamResponse(messages, userId = null, workspaceConfig = {}, agentConfig = {}) {
  const formatted = messages.map((msg) => {
    if (msg.role === "user") return new HumanMessage(msg.content);
    return new AIMessage(msg.content);
  });

  // Combine agent system prompt and custom workspace instructions
  let combinedSystemPrompt = (agentConfig && agentConfig.systemPrompt) || "You are Aura Assistant, a highly helpful, intelligent, and general-purpose conversational assistant. You have access to Web Search and Knowledge Base tools to help users answer their queries precisely and efficiently. When the user mentions or asks about an uploaded file, document, resume, or photo (e.g. using phrases like 'explain this photo', 'what is this image', 'show my file', etc.), you MUST immediately call the searchKnowledgeBase tool to retrieve its contents or visual descriptions. Do NOT ask the user for clarification before calling the searchKnowledgeBase tool. Maintain a professional, friendly, and structured communication style.";
  if (workspaceConfig.customInstructions) {
    combinedSystemPrompt += (combinedSystemPrompt ? "\n\n" : "") + `Workspace Guidelines:\n${workspaceConfig.customInstructions}`;
  }

  if (combinedSystemPrompt) {
    formatted.unshift(new SystemMessage(combinedSystemPrompt));
  }

  const activeAgent = userId
    ? createDynamicAgent(userId, workspaceConfig.workspaceId, agentConfig)
    : agent;

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