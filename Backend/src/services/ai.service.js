require("dotenv").config()
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatMistralAI } = require("@langchain/mistralai");
const { HumanMessage,SystemMessage,AIMessage } = require("@langchain/core/messages");

const geminimodel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY
});

const mistralmodel = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-small-latest",
});

async function generateResponse(messages){
    const res=await geminimodel.invoke(messages.map((msg)=>{
        if(msg.role=="user"){
          return new HumanMessage(msg);
        }else if(msg.role=="ai"){
          return new AIMessage(msg);
        }
    }));
    return res.content;
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
  generateTitleResponse
};