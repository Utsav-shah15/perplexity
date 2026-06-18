import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function sendMessage({ message, chatId }) {
  const response = await api.post("/chats/message", { message, chatId });
  return response.data;
}

export async function getChats(workspaceId) {
  const params = workspaceId ? { workspace: workspaceId } : {};
  const response = await api.get("/chats", { params });
  return response.data;
}

export async function getMessages({ chatId }) {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
}

export async function deleteChat({ chatId }) {
  const response = await api.delete(`/chats/${chatId}`);
  return response.data;
}
