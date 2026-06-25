const { processDocument, searchKnowledgeBase } = require("../services/rag.service");
const Document = require("../models/document.model");


// POST /knowledge/upload - Upload file(s) and process them into embeddings
async function uploadDocument(req, res) {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const processedDocs = [];
    const workspaceId = req.body.workspace || null;

    for (const file of files) {
      const { buffer, mimetype, originalname, size } = file;
      const filename = `${Date.now()}-${originalname}`;

      const doc = await processDocument({
        buffer,
        mimeType: mimetype,
        filename,
        originalName: originalname,
        size,
        userId: req.user.id,
        workspaceId,
      });
      processedDocs.push(doc);

      // Broadcast activity feed event if upload is scoped to a workspace
      if (workspaceId) {
        try {
          const { getIO } = require("../sockets/server.socket");
          const io = getIO();
          io.to(`workspace_${workspaceId}`).emit("workspace:activity", {
            type: "file_uploaded",
            user: req.user.email,
            filename: originalname,
            timestamp: new Date().toISOString(),
          });
        } catch (_) { /* socket not ready */ }
      }
    }

    res.status(200).json({
      success: true,
      message: `${processedDocs.length} file(s) uploaded and indexed successfully.`,
      documents: processedDocs,
    });

  } catch (error) {
    console.error("Error uploading document:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}


// GET /knowledge/documents- List all uploaded documents for the current user
async function getDocuments(req, res) {
  try {
    const { workspace } = req.query;
    const filter = { user: req.user.id };

    if (workspace) {
      filter.workspace = workspace;
    } else {
      filter.workspace = null;
    }

    const docs = await Document.find(filter)
      .select("originalName size status mimeType createdAt workspace")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, documents: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


// DELETE /knowledge/documents/:docId-Delete a document and its embeddings
async function deleteDocument(req, res) {
  try {
    const { docId } = req.params;

    const doc = await Document.findOneAndDelete({
      _id: docId,
      user: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.status(200).json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


// GET /knowledge/search?q=...- Manually search knowledge base
async function searchDocuments(req, res) {
  try {
    const { q, workspace } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }
    const result = await searchKnowledgeBase({ query: q, userId: req.user.id, workspaceId: workspace || null });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { uploadDocument, getDocuments, deleteDocument, searchDocuments };
