import { useState, useEffect, useCallback } from "react";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../services/knowledge.api";

export function useKnowledge() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Fetch all documents for the current user
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Upload a file and poll for ready status
  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await uploadDocument(file);
      setUploadSuccess(`"${file.name}" uploaded! Processing embeddings...`);

      // Poll for status updates (processing → ready)
      setTimeout(() => fetchDocuments(), 3000);
      setTimeout(() => fetchDocuments(), 8000);
      setTimeout(() => fetchDocuments(), 15000);
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [fetchDocuments]);

  // Delete a document by ID
  const handleDelete = useCallback(async (docId) => {
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Clear feedback messages
  const clearFeedback = useCallback(() => {
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  return {
    documents,
    loading,
    uploading,
    uploadError,
    uploadSuccess,
    handleUpload,
    handleDelete,
    fetchDocuments,
    clearFeedback,
  };
}
