require("dotenv").config()

// Patch @langchain/core/utils/uuid CommonJS export wrapper bug
try {
  const uuidModule = require("@langchain/core/utils/uuid");
  for (const key of ['v1', 'v4', 'v5', 'v6', 'v7', 'parse', 'stringify', 'validate', 'version']) {
    if (uuidModule[key] && typeof uuidModule[key] !== 'function' && typeof uuidModule[key].default === 'function') {
      Object.defineProperty(uuidModule, key, { value: uuidModule[key].default, enumerable: true, configurable: true });
    }
  }
} catch (e) {
  console.error("Failed to patch @langchain/core uuid module:", e);
}

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatMistralAI } = require("@langchain/mistralai");
const { HumanMessage,SystemMessage,AIMessage } = require("@langchain/core/messages");
const { createAgent } = require("langchain");
const { tool } = require("langchain/tools");
const zod = require("zod");
const { searchInternet } = require("./internet.service");

const geminimodel = new ChatGoogleGenerativeAI({
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY
});

const mistralmodel = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-small-latest",
});

const searchInternetTool=tool(
     searchInternet,
     {
        name:"searchInternet",
        description:"Use this tool to search the internet for information related to the user's query. It can be used to find recent news, facts, or any other information that may not be available in the model's training data.",
        schema:zod.object({
          query:zod.string().describe("The search query provided by the user.")
        })
     }
)

const agent=createAgent({
   model:geminimodel,
   tools:[searchInternetTool]
})


async function generateResponse(messages){
    const res=await agent.invoke({
      messages:messages.map(msg=>{
        if(msg.role==="user"){
          return new HumanMessage(msg.content);
        }else{
          return new AIMessage(msg.content);
        }
      }) 
    }); 
    return res.messages[res.messages.length-1].text;
}

async function* streamResponse(messages) {
    const formattedMessages = messages.map(msg => {
        if (msg.role === "user") {
            return new HumanMessage(msg.content);
        } else {
            return new AIMessage(msg.content);
        }
    });

    const eventStream = agent.streamEvents({
        messages: formattedMessages
    }, { version: "v2" });

    for await (const chunk of eventStream) {
        yield chunk;
    }
}

async function generateTitleResponse(message){
    
    const res=await mistralmodel.invoke([new SystemMessage(`
      You are an AI assistant.

      Your task is to generate a short and meaningful chat title based on the user's conversation.

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
      `),new HumanMessage(message)])
      
    return res.content;
}

module.exports={
  generateResponse,
  streamResponse,
  generateTitleResponse
};