import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// Upload a file to the knowledge base (optionally scoped to a workspace)
export async function uploadDocument(files, workspaceId) {
  const formData = new FormData();
  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  } else {
    formData.append("file", files);
  }
  if (workspaceId) {
    formData.append("workspace", workspaceId);
  }

  const response = await api.post("/knowledge/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// Get all uploaded documents (optionally filtered by workspace)
export async function getDocuments(workspaceId) {
  const params = workspaceId ? { workspace: workspaceId } : {};
  const response = await api.get("/knowledge/documents", { params });
  return response.data;
}

// Delete a document
export async function deleteDocument(docId) {
  const response = await api.delete(`/knowledge/documents/${docId}`);
  return response.data;
}
