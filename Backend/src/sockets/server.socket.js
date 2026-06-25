const { Server } = require("socket.io")
const jwt = require("jsonwebtoken");
const { streamResponse, generateTitleResponse } = require("../services/ai.service");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const Workspace = require("../models/workspace.model");

let io;

// Tracks currently active AI streams: { chatId -> { content, isActive } }
const activeStreams = {};

// Online Presence — { workspaceId -> Map<userId, { email, socketId }> }
const workspacePresence = {};

function broadcastPresence(workspaceId) {
    if (!io || !workspaceId) return;
    const members = workspacePresence[workspaceId];
    const onlineUsers = members ? Array.from(members.values()).map(v => v.email) : [];
    io.to(`workspace_${workspaceId}`).emit("workspace:presence", { workspaceId, onlineUsers });
}

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

function initSocket(httpServer) {
    io = new Server(httpServer, {
        maxHttpBufferSize: 1e8, // 100 MB buffer size limit for image uploads
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174"],
            credentials: true
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

    io.on("connection", (socket) => {
        logToFile(`A user connected: ${socket.id} (user: ${socket.user?.email})`);
        console.log(`🟢 Socket connected: ${socket.id} | User: ${socket.user?.email}`);

        // Join workspace room to sync history/sidebar
        socket.on("joinWorkspace", (workspaceId) => {
            if (workspaceId) {
                socket.join(`workspace_${workspaceId}`);
                // Track which workspace this socket is in for cleanup on disconnect
                socket._activeWorkspaceId = workspaceId;
                logToFile(`User ${socket.user?.email} joined workspace room: workspace_${workspaceId}`);

                // Online Presence: add user to presence map
                if (!workspacePresence[workspaceId]) {
                    workspacePresence[workspaceId] = new Map();
                }
                workspacePresence[workspaceId].set(socket.user.id, { email: socket.user.email, socketId: socket.id });
                broadcastPresence(workspaceId);
            }
        });

        socket.on("leaveWorkspace", (workspaceId) => {
            if (workspaceId) {
                socket.leave(`workspace_${workspaceId}`);
                socket._activeWorkspaceId = null;
                logToFile(`User ${socket.user?.email} left workspace room: workspace_${workspaceId}`);

                // Online Presence: remove user from presence map
                if (workspacePresence[workspaceId]) {
                    workspacePresence[workspaceId].delete(socket.user.id);
                    if (workspacePresence[workspaceId].size === 0) delete workspacePresence[workspaceId];
                    broadcastPresence(workspaceId);
                }
            }
        });

        // Join active chat room to sync real-time message streams
        socket.on("joinChat", (chatId) => {
            if (chatId) {
                socket.join(`chat_${chatId}`);
                logToFile(`User ${socket.user?.email} joined chat room: chat_${chatId}`);
                // If there is an active stream for this chat, send catch-up content immediately
                if (activeStreams[chatId] && activeStreams[chatId].isActive && activeStreams[chatId].content) {
                    socket.emit("streamCatchup", { chatId, content: activeStreams[chatId].content });
                    logToFile(`Sent streamCatchup to ${socket.user?.email} for chat ${chatId} (${activeStreams[chatId].content.length} chars so far)`);
                }
            }
        });

        socket.on("leaveChat", (chatId) => {
            if (chatId) {
                socket.leave(`chat_${chatId}`);
                logToFile(`User ${socket.user?.email} left chat room: chat_${chatId}`);
            }
        });

        socket.on("stopGeneration", () => {
            if (socket.activeGenerations) {
                for (const cid in socket.activeGenerations) {
                    socket.activeGenerations[cid] = false;
                    // Also clean up the catch-up buffer so late joiners get nothing
                    if (activeStreams[cid]) {
                        activeStreams[cid].isActive = false;
                        delete activeStreams[cid];
                    }
                }
                logToFile(`User requested stopGeneration. Cancelled all active streams for socket ${socket.id}`);
            }
        });

        socket.on("sendMessage", async ({ message, chatId, workspaceId, agentId, imageBase64, imageMimeType, images }) => {
            let activeChatId = chatId;
            try {
                logToFile(`Received sendMessage event. ChatId: ${chatId}, WorkspaceId: ${workspaceId}, AgentId: ${agentId}, Message: "${message}"`);
                let title = null;
                let chat = null;

                if (!activeChatId) {
                    if (workspaceId) {
                        // Check if the user has write access to the workspace (must be owner or editor)
                        const ws = await Workspace.findById(workspaceId);
                        if (!ws) {
                            socket.emit("error", { message: "Workspace not found" });
                            return;
                        }
                        const isOwner = ws.owner.toString() === socket.user.id;
                        const memberRecord = ws.members.find(m => m.user.toString() === socket.user.id);
                        const isEditor = memberRecord && (memberRecord.role === "editor" || memberRecord.role === "owner");

                        if (!isOwner && !isEditor) {
                            socket.emit("error", { message: "Access Denied: Viewers cannot send messages in this workspace" });
                            return;
                        }
                    }

                    logToFile("No activeChatId provided. Generating title...");
                    title = await generateTitleResponse(message);
                    logToFile(`Generated Title: "${title}"`);
                    chat = await Chat.create({
                        user: socket.user.id,
                        title,
                        workspace: workspaceId || null,
                        agent: agentId || null
                    });
                    activeChatId = chat._id.toString();
                    socket.join(`chat_${activeChatId}`); // Auto join the chat room
                    logToFile(`Created new chat with ID: ${activeChatId} under workspace: ${workspaceId || "personal"} with agent: ${agentId || "none"}`);
                } else {
                    // Verify access to existing chat
                    const existingChat = await Chat.findById(activeChatId);
                    if (!existingChat) {
                        socket.emit("error", { message: "Chat not found" });
                        return;
                    }
                    if (existingChat.workspace) {
                        const ws = await Workspace.findById(existingChat.workspace);
                        if (!ws) {
                            socket.emit("error", { message: "Workspace not found" });
                            return;
                        }
                        const isOwner = ws.owner.toString() === socket.user.id;
                        const memberRecord = ws.members.find(m => m.user.toString() === socket.user.id);
                        const isEditor = memberRecord && (memberRecord.role === "editor" || memberRecord.role === "owner");

                        if (!isOwner && !isEditor) {
                            socket.emit("error", { message: "Access Denied: Viewers cannot send messages in this workspace" });
                            return;
                        }
                    } else {
                        if (existingChat.user.toString() !== socket.user.id) {
                            socket.emit("error", { message: "Access Denied: Personal chat access denied" });
                            return;
                        }
                    }
                    // Ensure the sender is in the room
                    socket.join(`chat_${activeChatId}`);
                }

                // Save user message to database
                const usermessage = await Message.create({
                    chat: activeChatId,
                    role: "user",
                    content: message,
                    imageBase64: imageBase64 || null,
                    imageMimeType: imageMimeType || null,
                    images: images || (imageBase64 ? [{ base64: imageBase64, mimeType: imageMimeType }] : [])
                });
                logToFile(`Saved user message. ID: ${usermessage._id}`);

                if (!chatId) {
                    // Populate workspace and agent info for the new chat
                    const populatedChat = await Chat.findById(chat._id)
                        .populate("workspace", "name color icon")
                        .populate("agent", "name description icon color systemPrompt tools");
                    // Broadcast chat creation to everyone in the workspace room, or emit to sender if personal
                    if (workspaceId) {
                        io.to(`workspace_${workspaceId}`).emit("chatCreated", { chat: populatedChat, title, usermessage });
                        // Activity feed: new session created
                        io.to(`workspace_${workspaceId}`).emit("workspace:activity", {
                            type: "new_session",
                            user: socket.user.email,
                            title: title,
                            timestamp: new Date().toISOString(),
                        });
                    } else {
                        socket.emit("chatCreated", { chat: populatedChat, title, usermessage });
                    }
                    logToFile("Emitted chatCreated event");
                }

                // Broadcast user message to all subscribers of the chat room (so other viewers see it instantly)
                io.to(`chat_${activeChatId}`).emit("userMessage", { usermessage, chatId: activeChatId });
                logToFile("Broadcasted userMessage event to chat room");

                // Find all messages in the chat history
                const messages = await Message.find({ chat: activeChatId });
                logToFile(`Retrieved chat history. Total messages: ${messages.length}`);

                // Stream the response from the LangChain agent
                let fullContent = "";

                socket.activeGenerations = socket.activeGenerations || {};
                socket.activeGenerations[activeChatId] = true;

                // Register this stream so late-joining users can receive catch-up
                activeStreams[activeChatId] = { content: "", isActive: true };

                // Fetch workspace config if inside a workspace
                let workspaceConfig = {};
                if (workspaceId) {
                    const ws = await Workspace.findById(workspaceId);
                    if (ws) {
                        workspaceConfig = {
                            workspaceId: ws._id.toString(),
                            customInstructions: ws.customInstructions || "",
                        };
                    }
                }

                // Retrieve the full chat object to extract agent information
                const chatObj = await Chat.findById(activeChatId).populate("agent");
                let agentConfig = {};
                if (chatObj && chatObj.agent) {
                    agentConfig = {
                        systemPrompt: chatObj.agent.systemPrompt,
                        tools: chatObj.agent.tools
                    };
                }

                const stream = streamResponse(messages, socket.user.id, workspaceConfig, agentConfig, { 
                    imageBase64, 
                    imageMimeType, 
                    message,
                    images: images || (imageBase64 ? [{ base64: imageBase64, mimeType: imageMimeType }] : [])
                });

                logToFile("Starting agent streamEvents loop...");
                for await (const chunk of stream) {
                    if (!socket.activeGenerations || !socket.activeGenerations[activeChatId]) {
                        logToFile(`Stream generation stopped for chat_${activeChatId}`);
                        break;
                    }
                    logToFile(`Stream chunk received. Event: ${chunk.event}, Name: ${chunk.name}`);

                    // Determine broadcast target:
                    // Workspace chats → workspace room (all members already joined, no race condition)
                    // Personal chats  → only the sender socket
                    const broadcastTarget = workspaceId
                        ? io.to(`workspace_${workspaceId}`)
                        : socket;

                    if (chunk.event === "on_chat_model_stream") {
                        const text = chunk.data.chunk.content;
                        if (text) {
                            fullContent += text;
                            // Keep catch-up buffer updated for anyone who missed early chunks
                            if (activeStreams[activeChatId]) {
                                activeStreams[activeChatId].content = fullContent;
                            }
                            broadcastTarget.emit("chunk", { chunk: text, chatId: activeChatId });
                        }
                    } else if (chunk.event === "on_tool_start") {
                        logToFile(`Tool starting: ${chunk.name}`);
                        broadcastTarget.emit("toolStart", { toolName: chunk.name, chatId: activeChatId });
                    } else if (chunk.event === "on_tool_end") {
                        logToFile(`Tool ended: ${chunk.name}`);
                        broadcastTarget.emit("toolEnd", { toolName: chunk.name, output: chunk.data.output, chatId: activeChatId });
                    }
                }
                if (socket.activeGenerations) {
                    delete socket.activeGenerations[activeChatId];
                }
                // Mark stream as done and clean up catch-up buffer
                if (activeStreams[activeChatId]) {
                    activeStreams[activeChatId].isActive = false;
                    delete activeStreams[activeChatId];
                }
                logToFile("Stream loop completed successfully");

                // Save completed AI message to database
                const aimessage = await Message.create({
                    chat: activeChatId,
                    role: "ai",
                    content: fullContent
                });
                logToFile(`Saved AI response to database. ID: ${aimessage._id}`);

                // Broadcast completed message to everyone in the chat room
                io.to(`chat_${activeChatId}`).emit("messageComplete", { aimessage, usermessage, chatId: activeChatId });
                logToFile("Emitted messageComplete event to chat room");

            } catch (error) {
                if (socket.activeGenerations && activeChatId) {
                    delete socket.activeGenerations[activeChatId];
                }
                // Clean up catch-up buffer on error
                if (activeChatId && activeStreams[activeChatId]) {
                    activeStreams[activeChatId].isActive = false;
                    delete activeStreams[activeChatId];
                }
                logToFile(`Error in socket sendMessage: ${error.message}\nStack: ${error.stack}`);
                console.error("Error in socket sendMessage:", error);
                socket.emit("error", { message: "Error processing your request", details: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔴 Socket disconnected: ${socket.id}`);
            logToFile(`Socket disconnected: ${socket.id}`);

            // Clean up online presence on disconnect
            const wsId = socket._activeWorkspaceId;
            if (wsId && workspacePresence[wsId]) {
                workspacePresence[wsId].delete(socket.user.id);
                if (workspacePresence[wsId].size === 0) delete workspacePresence[wsId];
                broadcastPresence(wsId);
            }
        });
    })
}

function getIO() {
    if (!io) {
        throw new Error("socket.io is not initialized");
    }

    return io;
}

module.exports = {
    initSocket,
    getIO
}