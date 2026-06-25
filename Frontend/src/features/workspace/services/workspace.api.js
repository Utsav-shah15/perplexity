import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function createWorkspace({ name, description, color, icon }) {
  const response = await api.post("/workspaces", { name, description, color, icon });
  return response.data;
}

export async function getWorkspaces() {
  const response = await api.get("/workspaces");
  return response.data;
}

export async function getWorkspace(workspaceId) {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data;
}

export async function updateWorkspace(workspaceId, data) {
  const response = await api.patch(`/workspaces/${workspaceId}`, data);
  return response.data;
}

export async function deleteWorkspace(workspaceId) {
  const response = await api.delete(`/workspaces/${workspaceId}`);
  return response.data;
}

export async function inviteMember(workspaceId, { email, role }) {
  const response = await api.post(`/workspaces/${workspaceId}/invite`, { email, role });
  return response.data;
}

export async function removeMember(workspaceId, userId) {
  const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  return response.data;
}

export async function updateMemberRole(workspaceId, userId, role) {
  const response = await api.patch(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
  return response.data;
}

export async function getWorkspaceChats(workspaceId) {
  const response = await api.get(`/workspaces/${workspaceId}/chats`);
  return response.data;
}
