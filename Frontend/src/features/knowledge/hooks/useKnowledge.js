import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
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

  // Read active workspace from Redux
  const { activeWorkspaceId } = useSelector((state) => state.workspace);

  // Fetch documents — filtered by active workspace
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDocuments(activeWorkspaceId);
      setDocuments(data.documents || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Upload file(s) — scoped to active workspace
  const handleUpload = useCallback(async (files) => {
    if (!files || (Array.isArray(files) && files.length === 0)) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await uploadDocument(files, activeWorkspaceId);
      const message = Array.isArray(files)
        ? `${files.length} document(s) uploaded and indexed successfully!`
        : `"${files.name}" uploaded and indexed successfully!`;
      setUploadSuccess(message);
      fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [fetchDocuments, activeWorkspaceId]);

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
