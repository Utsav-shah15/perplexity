const {Server}=require("socket.io")
const jwt=require("jsonwebtoken");
const { streamResponse, generateTitleResponse } = require("../services/ai.service");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

let io;

function parseCookies(cookieHeader) {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach(cookie => {
        let parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    return list;
}

const fs = require("fs");
const path = require("path");

const logFilePath = path.join(__dirname, "../../socket_logs.txt");
function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
}

function initSocket(httpServer){
    io=new Server(httpServer,{
        cors:{
            origin:"http://localhost:5173",
            credentials:true
        }
    })

    logToFile("Socket.io server initialized");

    // Authenticate socket connection using cookies
    io.use((socket, next) => {
        try {
            logToFile(`Socket Handshake Headers Cookie: ${socket.handshake.headers.cookie}`);
            const cookies = parseCookies(socket.handshake.headers.cookie);
            logToFile(`Parsed Cookies: ${JSON.stringify(cookies)}`);
            const token = cookies.token;
            if (!token) {
                logToFile("Socket Auth Error: No token provided in cookies");
                return next(new Error("Authentication error: No token provided"));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            logToFile(`Socket Auth Success for user: ${decoded.email}`);
            next();
        } catch (err) {
            logToFile(`Socket Auth Exception: ${err.message}`);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection",(socket)=>{
        logToFile(`A user connected: ${socket.id} (user: ${socket.user?.email})`);

        socket.on("sendMessage", async ({ message, chatId }) => {
            try {
                logToFile(`Received sendMessage event. ChatId: ${chatId}, Message: "${message}"`);
                let activeChatId = chatId;
                let title = null;
                let chat = null;

                if (!activeChatId) {
                    logToFile("No activeChatId provided. Generating title...");
                    title = await generateTitleResponse(message);
                    logToFile(`Generated Title: "${title}"`);
                    chat = await Chat.create({
                        user: socket.user.id,
                        title
                    });
                    activeChatId = chat._id.toString();
                    logToFile(`Created new chat with ID: ${activeChatId}`);
                }

                // Save user message to database
                const usermessage = await Message.create({
                    chat: activeChatId,
                    role: "user",
                    content: message
                });
                logToFile(`Saved user message. ID: ${usermessage._id}`);

                if (!chatId) {
                    // Notify client of the new chat creation
                    socket.emit("chatCreated", { chat, title, usermessage });
                    logToFile("Emitted chatCreated event");
                }

                // Emit acknowledgement that user message is saved
                socket.emit("userMessageSaved", { usermessage, chatId: activeChatId });
                logToFile("Emitted userMessageSaved event");

                // Find all messages in the chat history
                const messages = await Message.find({ chat: activeChatId });
                logToFile(`Retrieved chat history. Total messages: ${messages.length}`);

                // Stream the response from the LangChain agent
                let fullContent = "";
                const stream = streamResponse(messages, socket.user.id);

                logToFile("Starting agent streamEvents loop...");
                for await (const chunk of stream) {
                    logToFile(`Stream chunk received. Event: ${chunk.event}, Name: ${chunk.name}`);
                    if (chunk.event === "on_chat_model_stream") {
                        const text = chunk.data.chunk.content;
                        if (text) {
                            fullContent += text;
                            socket.emit("chunk", { chunk: text, chatId: activeChatId });
                        }
                    } else if (chunk.event === "on_tool_start") {
                        logToFile(`Tool starting: ${chunk.name}`);
                        socket.emit("toolStart", { toolName: chunk.name, chatId: activeChatId });
                    } else if (chunk.event === "on_tool_end") {
                        logToFile(`Tool ended: ${chunk.name}`);
                        socket.emit("toolEnd", { toolName: chunk.name, output: chunk.data.output, chatId: activeChatId });
                    }
                }
                logToFile("Stream loop completed successfully");

                // Save completed AI message to database
                const aimessage = await Message.create({
                    chat: activeChatId,
                    role: "ai",
                    content: fullContent
                });
                logToFile(`Saved AI response to database. ID: ${aimessage._id}`);

                // Emit completed message
                socket.emit("messageComplete", { aimessage, usermessage, chatId: activeChatId });
                logToFile("Emitted messageComplete event");

            } catch (error) {
                logToFile(`Error in socket sendMessage: ${error.message}\nStack: ${error.stack}`);
                console.error("Error in socket sendMessage:", error);
                socket.emit("error", { message: "Error processing your request", details: error.message });
            }
        });
    })
}

function getIO(){
    if(!io){
        throw new Error("socket.io is not initialized");
    }

    return io;
}

module.exports={
    initSocket,
    getIO
}