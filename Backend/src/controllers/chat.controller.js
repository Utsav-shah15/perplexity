require("dotenv").config();
const { generateResponse, generateTitleResponse } = require("../services/ai.service");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const Workspace = require("../models/workspace.model");

async function sendMessage(req, res) {
    try {
        const { message, workspaceId, agentId } = req.body;
        const chatId = req.body.chatId || req.body.chat;

        let title = null, chat = null, existingChat = null;

        if (!chatId) {
            if (workspaceId) {
                // Check if user has write access to the workspace (must be owner or editor)
                const ws = await Workspace.findById(workspaceId);
                if (!ws) {
                    return res.status(404).json({
                        message: "Workspace not found"
                    });
                }
                const isOwner = ws.owner.toString() === req.user.id;
                const memberRecord = ws.members.find(m => m.user.toString() === req.user.id);
                const isEditor = memberRecord && (memberRecord.role === "editor" || memberRecord.role === "owner");

                if (!isOwner && !isEditor) {
                    return res.status(403).json({
                        message: "Access Denied: Viewers cannot send messages in this workspace"
                    });
                }
            }

            title = await generateTitleResponse(message);
            chat = await Chat.create({
                user: req.user.id,
                title,
                workspace: workspaceId || null,
                agent: agentId || null
            });
            // Populate workspace and agent info for the new chat
            chat = await Chat.findById(chat._id)
                .populate("workspace", "name color icon")
                .populate("agent", "name description icon color systemPrompt tools");
        } else {
            // Verify existing chat access
            existingChat = await Chat.findById(chatId).populate("agent");
            if (!existingChat) {
                return res.status(404).json({
                    message: "Chat not found"
                });
            }
            if (existingChat.workspace) {
                const ws = await Workspace.findById(existingChat.workspace);
                if (!ws) {
                    return res.status(404).json({
                        message: "Workspace not found"
                    });
                }
                const isOwner = ws.owner.toString() === req.user.id;
                const memberRecord = ws.members.find(m => m.user.toString() === req.user.id);
                const isEditor = memberRecord && (memberRecord.role === "editor" || memberRecord.role === "owner");

                if (!isOwner && !isEditor) {
                    return res.status(403).json({
                        message: "Access Denied: Viewers cannot send messages in this workspace"
                    });
                }
            } else {
                if (existingChat.user.toString() !== req.user.id) {
                    return res.status(403).json({
                        message: "Access Denied: Personal chat access denied"
                    });
                }
            }
        }

        const usermessage = await Message.create({
            chat: chatId || chat._id,
            role: "user",
            content: message
        });

        const messages = await Message.find({ chat: chatId || chat._id });

        // Retrieve workspace and agent config
        const chatObj = chatId ? existingChat : chat;
        let workspaceConfig = {};
        if (chatObj && chatObj.workspace) {
            const ws = await Workspace.findById(chatObj.workspace);
            if (ws) {
                workspaceConfig = {
                    workspaceId: ws._id.toString(),
                    customInstructions: ws.customInstructions || "",
                };
            }
        }

        let agentConfig = {};
        if (chatObj && chatObj.agent) {
            agentConfig = {
                systemPrompt: chatObj.agent.systemPrompt,
                tools: chatObj.agent.tools
            };
        }

        const response = await generateResponse(messages, req.user.id, workspaceConfig, agentConfig);

        const aimessage = await Message.create({
            chat: chatId || chat._id,
            role: "ai",
            content: response
        });

        res.status(201).json({
            title,
            chat: chatObj,
            usermessage,
            aimessage
        });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            message: "Error sending message",
            error: error.message
        });
    }
}

async function getChats(req, res) {
    try {
        const user = req.user;
        const { workspace } = req.query;

        const filter = {};

        if (workspace === "null") {
            // Personal chats: must be owned by the user and have no workspace
            filter.user = user.id;
            filter.workspace = null;
        } else if (workspace && workspace !== "all") {
            // Workspace chats: verify membership, then get all chats in this workspace
            const ws = await Workspace.findOne({
                _id: workspace,
                $or: [
                    { owner: user.id },
                    { "members.user": user.id }
                ]
            });
            if (!ws) {
                return res.status(403).json({
                    message: "Access Denied: You are not a member of this workspace"
                });
            }
            filter.workspace = workspace;
        } else {
            // "all" or undefined: get user's personal chats AND all chats of workspaces user is a member of
            const userWorkspaces = await Workspace.find({
                $or: [
                    { owner: user.id },
                    { "members.user": user.id }
                ]
            }).select("_id");
            const wsIds = userWorkspaces.map(w => w._id);

            filter.$or = [
                { user: user.id, workspace: null },
                { workspace: { $in: wsIds } }
            ];
        }

        console.log("getChats filter:", JSON.stringify(filter));
        const chats = await Chat.find(filter)
            .populate("workspace", "name color icon")
            .populate("agent", "name description icon color systemPrompt tools")
            .sort({ updatedAt: -1 });

        console.log(`getChats found ${chats.length} chats for workspace: ${workspace || "all"}`);

        res.status(200).json({
            message: "Chats retrieved successfully",
            chats
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving chats",
            error: error.message
        });
    }
}

async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                message: "chat not found"
            });
        }

        // Verify authorization to view messages
        if (chat.workspace) {
            const ws = await Workspace.findOne({
                _id: chat.workspace,
                $or: [
                    { owner: req.user.id },
                    { "members.user": req.user.id }
                ]
            });
            if (!ws) {
                return res.status(403).json({
                    message: "Access Denied: You do not have access to this workspace chat"
                });
            }
        } else {
            if (chat.user.toString() !== req.user.id) {
                return res.status(403).json({
                    message: "Access Denied: You do not have access to this chat"
                });
            }
        }

        const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });

        res.status(200).json({
            messages
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving messages",
            error: error.message
        });
    }
}

async function deletechat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                message: "chat not found"
            });
        }

        // Check delete authorization
        let isAuthorized = false;
        if (chat.workspace) {
            const ws = await Workspace.findOne({
                _id: chat.workspace,
                $or: [
                    { owner: req.user.id },
                    { "members.user": req.user.id }
                ]
            });
            if (ws) {
                const memberRecord = ws.members.find(m => m.user.toString() === req.user.id);
                const isWorkspaceOwner = ws.owner.toString() === req.user.id;
                const isChatCreator = chat.user.toString() === req.user.id;
                const isEditor = memberRecord && memberRecord.role === "editor";

                if (isWorkspaceOwner || isChatCreator || isEditor) {
                    isAuthorized = true;
                }
            }
        } else {
            if (chat.user.toString() === req.user.id) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({
                message: "You are not authorized to delete this chat"
            });
        }

        await Chat.findByIdAndDelete(chatId);
        await Message.deleteMany({ chat: chatId });

        res.status(200).json({
            message: "Chat deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting chat",
            error: error.message
        });
    }
}

module.exports = {
    sendMessage,
    getChats,
    getMessages,
    deletechat
};