require("dotenv").config()
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_API_KEY
});

async function testAi(){
    await model.invoke("explain mongodb")
    .then((res)=>{console.log(res)})
}
