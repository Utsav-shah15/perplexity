import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getMarketplace() {
  const response = await api.get("/agents/marketplace");
  return response.data;
}

export async function createAgent(agentData) {
  const response = await api.post("/agents", agentData);
  return response.data;
}

export async function deployAgent(workspaceId, agentId) {
  const response = await api.post(`/agents/workspaces/${workspaceId}/deploy/${agentId}`);
  return response.data;
}

export async function undeployAgent(workspaceId, agentId) {
  const response = await api.delete(`/agents/workspaces/${workspaceId}/deploy/${agentId}`);
  return response.data;
}
