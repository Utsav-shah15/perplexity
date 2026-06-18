require("dotenv").config();
const { generateResponse, generateTitleResponse } = require("../services/ai.service");
const Chat = require("../models/chat.model")
const Message = require("../models/message.model");

async function sendMessage(req, res) {
    try {
        const { message } = req.body;
        const chatId = req.body.chatId || req.body.chat;

        let title = null, chat = null;

        if (!chatId) {
            title = await generateTitleResponse(message);
            chat = await Chat.create({
                user: req.user.id,
                title
            })
        }

        const usermessage = await Message.create({
            chat: chatId || chat._id,
            role: "user",
            content: message
        })

        const messages = await Message.find({ chat: chatId || chat._id })

        const response = await generateResponse(messages, req.user.id);

        const aimessage = await Message.create({
            chat: chatId || chat._id,
            role: "ai",
            content: response
        })

        res.status(201).json({
            title,
            chat,
            usermessage,
            aimessage
        })
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            message: "Error sending message",
            error: error.message
        })
    }
}

async function getChats(req, res) {
    try {
        const user = req.user;
        const { workspace } = req.query;

        const filter = { user: user.id };
        if (workspace) {
            filter.workspace = workspace;
        } else {
            filter.workspace = null;
        }

        console.log("getChats filter:", JSON.stringify(filter));
        const chats = await Chat.find(filter).sort({ updatedAt: -1 });
        console.log(`getChats found ${chats.length} chats for workspace: ${workspace || "personal"}`);

        res.status(200).json({
            message: "Chats retrieved successfully",
            chats
        })
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving chats",
            error: error.message
        })
    }
}

async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user.id
        })

        if (!chat) {
            return res.status(404).json({
                "message": "chat not found"
            })
        }

        const messages = await Message.find({
            chat: chatId
        })

        res.status(200).json({
            messages
        })
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving messages",
            error: error.message
        })
    }
}

async function deletechat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOneAndDelete({
            _id: chatId,
            user: req.user.id
        })

        if (!chat) {
            return res.status(404).json({
                message: "chat not found"
            })
        }

        await Message.deleteMany({
            chat: chatId
        })

        res.status(200).json({
            message: "Chat deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "Error deleting chat",
            error: error.message
        })
    }
}

module.exports = {
    sendMessage,
    getChats,
    getMessages,
    deletechat
}