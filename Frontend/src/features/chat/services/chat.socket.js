import { io } from "socket.io-client";
import { store } from "../../../app/app.store";
import {
    createNewChat,
    addNewMessage,
    deleteChatFromState,
    appendMessageChunk,
    setToolStatus,
    setLoading,
    setGenerating,
    setCurrentChatId,
    finalizeAIMessage
} from "../chat.slice";

let socket = typeof window !== "undefined" && window.__socket__ ? window.__socket__ : null;

export const getSocket = () => {
    if (typeof window !== "undefined" && window.__socket__) {
        socket = window.__socket__;
    }
    return socket;
};

export const joinWorkspaceRoom = (workspaceId) => {
    const s = getSocket();
    if (s && s.connected && workspaceId) {
        s.emit("joinWorkspace", workspaceId);
    }
};

export const leaveWorkspaceRoom = (workspaceId) => {
    const s = getSocket();
    if (s && s.connected && workspaceId) {
        s.emit("leaveWorkspace", workspaceId);
    }
};

export const joinChatRoom = (chatId) => {
    const s = getSocket();
    if (s && s.connected && chatId) {
        s.emit("joinChat", chatId);
    }
};

export const leaveChatRoom = (chatId) => {
    const s = getSocket();
    if (s && s.connected && chatId) {
        s.emit("leaveChat", chatId);
    }
};

export const initializeSocketConnection = (dispatch) => {
    if (typeof window !== "undefined" && window.__socket__) {
        socket = window.__socket__;
    }
    if (!socket) {
        socket = io("http://localhost:3000", {
            withCredentials: true
        });
        if (typeof window !== "undefined") {
            window.__socket__ = socket;
        }

        socket.on("connect", () => {
            console.log("connected to Socket.IO server");
            // Auto-join active rooms on reconnect/initial connect
            const state = store.getState();
            const { currentChatId } = state.chat;
            const { activeWorkspaceId } = state.workspace;
            if (activeWorkspaceId) {
                socket.emit("joinWorkspace", activeWorkspaceId);
            }
            if (currentChatId && currentChatId !== "temp-chat") {
                socket.emit("joinChat", currentChatId);
            }
        });

        socket.on("connect_error", (err) => {
            console.error("Socket.io connect_error:", err.message);
        });

        socket.on("chatCreated", ({ chat, title, usermessage }) => {
            const state = store.getState();
            const currentUserId = state.auth.user?._id || state.auth.user?.id;
            const chatCreatorId = chat.user?._id || chat.user;
            const activeWorkspaceId = state.workspace.activeWorkspaceId;

            // Only append the chat if it belongs to the currently active workspace
            const chatWorkspaceId = chat.workspace?._id || chat.workspace;
            const activeWSIdStr = activeWorkspaceId ? activeWorkspaceId.toString() : null;
            const chatWSIdStr = chatWorkspaceId ? chatWorkspaceId.toString() : null;

            if (activeWSIdStr && chatWSIdStr && activeWSIdStr !== chatWSIdStr) {
                // Ignore chat creation for other workspaces
                return;
            }

            const isCreator = currentUserId && chatCreatorId && currentUserId.toString() === chatCreatorId.toString();

            if (isCreator) {
                // Creator: switch focus to the new real chat, remove temp-chat
                dispatch(createNewChat({ chatId: chat._id, title, workspace: chat.workspace, agent: chat.agent }));
                dispatch(addNewMessage({ chatId: chat._id, message: usermessage }));
                dispatch(setCurrentChatId(chat._id));
                dispatch(deleteChatFromState("temp-chat"));
                // Creator already joined the room server-side; re-emit just in case
                socket.emit("joinChat", chat._id);
            } else {
                // Observer: add to sidebar silently WITHOUT stealing focus.
                // CRITICAL: Immediately join the chat room so we receive streaming chunks.
                // Cannot wait for DashBoard useEffect (fires too late, misses chunks).
                dispatch(createNewChat({ chatId: chat._id, title, workspace: chat.workspace, agent: chat.agent }));
                dispatch(addNewMessage({ chatId: chat._id, message: usermessage }));
                socket.emit("joinChat", chat._id);  // join immediately — do NOT change currentChatId
            }
        });

        socket.on("userMessage", ({ usermessage, chatId }) => {
            const state = store.getState();
            // Guard: check if the chat actually exists in the current workspace's loaded chats
            if (!state.chat.chats[chatId]) {
                return;
            }

            // If it is the current active chat, set loading and generating to true for all room participants
            if (state.chat.currentChatId === chatId) {
                dispatch(setLoading(true));
                dispatch(setGenerating(true));
            }

            const chatMessages = state.chat.chats[chatId].messages || [];
            const exists = chatMessages.some(m => m._id === usermessage._id || (m.content === usermessage.content && m.role === "user"));

            // If the message does not exist (meaning it came from another user), append it
            if (!exists) {
                dispatch(addNewMessage({ chatId, message: usermessage }));
            }
        });

        socket.on("toolStart", ({ toolName, chatId }) => {
            const state = store.getState();
            if (!state.chat.chats[chatId]) return;
            dispatch(setLoading(false));
            if (state.chat.currentChatId === chatId) {
                dispatch(setGenerating(true));
            }
            let status = "⚙️ Working...";
            if (toolName === "searchInternet") {
                status = "🔍 Searching the web...";
            } else if (toolName === "searchKnowledgeBase") {
                status = "📂 Reading uploaded documents...";
            }
            dispatch(setToolStatus({ chatId, status }));
        });

        socket.on("streamCatchup", ({ chatId, content }) => {
            const state = store.getState();
            if (!state.chat.chats[chatId]) return;
            // Set the accumulated content as a partial AI message so the observer
            // immediately sees progress instead of waiting for messageComplete
            const messages = state.chat.chats[chatId].messages;
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && (lastMsg.role === "ai" || lastMsg.role === "assistant")) {
                // Already have a partial AI message — only update if catch-up is longer
                if (content.length > lastMsg.content.length) {
                    dispatch(appendMessageChunk({ chatId, chunk: content.slice(lastMsg.content.length) }));
                }
            } else {
                // No AI message yet — create one with full catch-up content
                dispatch(appendMessageChunk({ chatId, chunk: content }));
            }
            if (state.chat.currentChatId === chatId) {
                dispatch(setGenerating(true));
                dispatch(setLoading(false));
            }
        });

        socket.on("chunk", ({ chunk, chatId }) => {
            const state = store.getState();
            if (!state.chat.chats[chatId]) return;
            dispatch(setLoading(false));
            if (state.chat.currentChatId === chatId) {
                dispatch(setGenerating(true));
            }
            dispatch(appendMessageChunk({ chatId, chunk }));
        });

        socket.on("messageComplete", ({ aimessage, usermessage, chatId }) => {
            const state = store.getState();
            if (!state.chat.chats[chatId]) return;
            dispatch(setLoading(false));
            dispatch(setGenerating(false));
            dispatch(finalizeAIMessage({ chatId, aimessage }));
        });

        socket.on("error", (err) => {
            console.error("Socket error event:", err);
            dispatch(setLoading(false));
            dispatch(setGenerating(false));
        });

        // Real-Time Activity Feed
        socket.on("workspace:activity", (activity) => {
            // Dispatch to any registered callback
            if (socket._onActivity) socket._onActivity(activity);
        });

        // Online Presence
        socket.on("workspace:presence", ({ workspaceId, onlineUsers }) => {
            if (socket._onPresence) socket._onPresence({ workspaceId, onlineUsers });
        });

        socket.on("disconnect", () => {
            console.log("disconnected from Socket.IO server");
        });
    }
    return socket;
};

// Register/unregister callbacks for activity feed and presence (used by WorkspaceDetailPage)
export const onWorkspaceActivity = (callback) => {
    const s = getSocket();
    if (s) s._onActivity = callback;
};

export const offWorkspaceActivity = () => {
    const s = getSocket();
    if (s) s._onActivity = null;
};

export const onWorkspacePresence = (callback) => {
    const s = getSocket();
    if (s) s._onPresence = callback;
};

export const offWorkspacePresence = () => {
    const s = getSocket();
    if (s) s._onPresence = null;
};
