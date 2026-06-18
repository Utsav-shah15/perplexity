import { io } from "socket.io-client";
import {
    createNewChat,
    addNewMessage,
    deleteChatFromState,
    appendMessageChunk,
    setToolStatus,
    setLoading,
    setCurrentChatId
} from "../chat.slice";

let socket = null;

export const getSocket = () => socket;

export const initializeSocketConnection = (dispatch) => {
    if (!socket) {
        socket = io("http://localhost:3000", {
            withCredentials: true
        });

        socket.on("connect", () => {
            console.log("connected to Socket.IO server");
        });

        socket.on("connect_error", (err) => {
            console.error("Socket.io connect_error:", err.message);
        });

        socket.on("chatCreated", ({ chat, title, usermessage }) => {
            dispatch(createNewChat({ chatId: chat._id, title }));
            dispatch(addNewMessage({ chatId: chat._id, message: usermessage }));
            dispatch(setCurrentChatId(chat._id));
            dispatch(deleteChatFromState("temp-chat"));
        });

        socket.on("toolStart", ({ toolName, chatId }) => {
            dispatch(setLoading(false));
            dispatch(setToolStatus({ chatId, status: `🔍 Searching the web...` }));
        });

        socket.on("userMessageSaved", ({ usermessage, chatId }) => {
            // User message confirmed saved in DB — no extra action needed
        });

        socket.on("chunk", ({ chunk, chatId }) => {
            dispatch(setLoading(false));
            dispatch(appendMessageChunk({ chatId, chunk }));
        });

        socket.on("messageComplete", ({ aimessage, usermessage, chatId }) => {
            dispatch(setLoading(false));
        });

        socket.on("error", (err) => {
            console.error("Socket error event:", err);
            dispatch(setLoading(false));
        });

        socket.on("disconnect", () => {
            console.log("disconnected from Socket.IO server");
        });
    }
    return socket;
};
