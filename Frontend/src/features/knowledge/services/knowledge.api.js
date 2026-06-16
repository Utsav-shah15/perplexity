import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// Upload a file to the knowledge base
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/knowledge/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// Get all uploaded documents 
export async function getDocuments() {
  const response = await api.get("/knowledge/documents");
  return response.data;
}

// Delete a document
export async function deleteDocument(docId) {
  const response = await api.delete(`/knowledge/documents/${docId}`);
  return response.data;
}
