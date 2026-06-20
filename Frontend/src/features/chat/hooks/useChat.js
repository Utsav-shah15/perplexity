import { useCallback } from "react";
import { initializeSocketConnection, getSocket } from "../services/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../services/chat.api";
import { useDispatch, useSelector } from "react-redux";
import {
  setChats,
  setCurrentChatId,
  setIsError,
  setLoading,
  setGenerating,
  createNewChat,
  addNewMessage,
  setMessages,
  deleteChatFromState,
} from "../chat.slice";
import { setSelectedAgentId } from "../../agent/agent.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const { currentChatId } = useSelector((state) => state.chat);
  const { activeWorkspaceId } = useSelector((state) => state.workspace);
  const { selectedAgentId } = useSelector((state) => state.agent);

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
        dispatch(setCurrentChatId("temp-chat"));
      }

      dispatch(setLoading(true));
      dispatch(setGenerating(true));

      const socket = getSocket();

      if (socket && socket.connected) {
        // Prefer real-time socket streaming
        socket.emit("sendMessage", { 
          message, 
          chatId, 
          workspaceId: activeWorkspaceId,
          agentId: selectedAgentId
        });
      } else {
        // HTTP fallback
        const data = await sendMessage({ 
          message, 
          chatId, 
          workspaceId: activeWorkspaceId,
          agentId: selectedAgentId
        });
        const { chat, aimessage, usermessage, title } = data;

        if (!chatId) {
          dispatch(createNewChat({ chatId: chat._id, title, workspace: chat.workspace, agent: chat.agent }));
          dispatch(setCurrentChatId(chat._id));
          dispatch(addNewMessage({ chatId: chat._id, message: usermessage }));
          dispatch(addNewMessage({ chatId: chat._id, message: aimessage }));
          dispatch(deleteChatFromState("temp-chat"));
        } else {
          dispatch(addNewMessage({ chatId, message: aimessage }));
        }
        dispatch(setLoading(false));
        dispatch(setGenerating(false));
      }

      // Clear selected agent once message is processed
      dispatch(setSelectedAgentId(null));
    } catch {
      dispatch(setIsError(true));
      if (!chatId) {
        dispatch(deleteChatFromState("temp-chat"));
        dispatch(setCurrentChatId(null));
      }
      dispatch(setLoading(false));
      dispatch(setGenerating(false));
    }
  }, [dispatch, activeWorkspaceId, selectedAgentId]);

  // Fetch all chats for the current user (filtered by workspace)
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
          workspace: chat.workspace, // Save workspace object (name, color, icon, etc.)
          agent: chat.agent, // Save agent details
        };
        return acc;
      }, {});
      dispatch(setChats(normalized));
    } catch (err) {
      console.error("Error fetching chats:", err);
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

  // Stop streaming generation
  const handleStopGeneration = useCallback((chatId) => {
    const socket = getSocket();
    if (socket && socket.connected && chatId) {
      socket.emit("stopGeneration", { chatId });
    }
    dispatch(setGenerating(false));
  }, [dispatch]);

  return {
    initializeSocketConnection: initializeSocket,
    handlechatMessage: handleSendMessage,
    handleGetChats,
    handleGetMessages,
    handleDeleteChat,
    handleStopGeneration,
  };
};
