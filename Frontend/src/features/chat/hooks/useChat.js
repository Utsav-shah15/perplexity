import { useCallback } from "react";
import { initializeSocketConnection, getSocket } from "../services/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../services/chat.api";
import { useDispatch, useSelector } from "react-redux";
import {
  setChats,
  setCurrentChatId,
  setIsError,
  setLoading,
  createNewChat,
  addNewMessage,
  setMessages,
  deleteChatFromState,
} from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const { currentChatId } = useSelector((state) => state.chat);
  const { activeWorkspaceId } = useSelector((state) => state.workspace);

  // Initialize socket and attach Redux dispatch listeners
  const initializeSocket = useCallback(() => {
    initializeSocketConnection(dispatch);
  }, [dispatch]);

  // handle  
  const handleSendMessage = useCallback(async ({ message, chatId }) => {
    try {
      // Optimistic update — add user message instantly
      if (chatId) {
        dispatch(addNewMessage({
          chatId,
          message: {
            role: "user",
            content: message,
            createdAt: new Date().toISOString(),
          },
        }));
      } else {
        // Temporary chat until server gives us a real ID
        dispatch(createNewChat({ chatId: "temp-chat", title: "New Chat..." }));
        dispatch(addNewMessage({
          chatId: "temp-chat",
          message: {
            role: "user",
            content: message,
            createdAt: new Date().toISOString(),
          },
        }));
      }

      dispatch(setLoading(true));

      const socket = getSocket();

      if (socket && socket.connected) {
        // Prefer real-time socket streaming
        socket.emit("sendMessage", { message, chatId, workspaceId: activeWorkspaceId });
      } else {
        // HTTP fallback
        const data = await sendMessage({ message, chatId });
        const { chat, aimessage, usermessage, title } = data;

        if (!chatId) {
          dispatch(createNewChat({ chatId: chat._id, title }));
          dispatch(addNewMessage({ chatId: chat._id, message: usermessage }));
          dispatch(addNewMessage({ chatId: chat._id, message: aimessage }));
          dispatch(deleteChatFromState("temp-chat"));
        } else {
          dispatch(addNewMessage({ chatId, message: aimessage }));
        }
        dispatch(setLoading(false));
      }
    } catch {
      dispatch(setIsError(true));
      if (!chatId) {
        dispatch(deleteChatFromState("temp-chat"));
        dispatch(setCurrentChatId(null));
      }
      dispatch(setLoading(false));
    }
  }, [dispatch, activeWorkspaceId]);

  // Fetch all chats for the current user (filtered by workspace)
  // Accepts optional explicit workspaceId to override Redux state
  const handleGetChats = useCallback(async (explicitWorkspaceId) => {
    try {
      dispatch(setLoading(true));
      const wsId = explicitWorkspaceId !== undefined ? explicitWorkspaceId : activeWorkspaceId;
      const data = await getChats(wsId);
      const normalized = data.chats.reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title,
          messages: [],
          lastUpdated: chat.updatedAt,
        };
        return acc;
      }, {});
      dispatch(setChats(normalized));
    } catch {
      dispatch(setIsError(true));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, activeWorkspaceId]);

  // Fetch messages for a specific chat
  const handleGetMessages = useCallback(async (chatId) => {
    try {
      dispatch(setLoading(true));
      const data = await getMessages({ chatId });
      dispatch(setMessages({ chatId, messages: data.messages }));
    } catch {
      dispatch(setIsError(true));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Delete a chat
  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      dispatch(setLoading(true));
      await deleteChat({ chatId });
      dispatch(deleteChatFromState(chatId));
      if (currentChatId === chatId) {
        dispatch(setCurrentChatId(null));
      }
    } catch {
      dispatch(setIsError(true));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, currentChatId]);

  return {
    initializeSocketConnection: initializeSocket,
    handlechatMessage: handleSendMessage,
    handleGetChats,
    handleGetMessages,
    handleDeleteChat,
  };
};
