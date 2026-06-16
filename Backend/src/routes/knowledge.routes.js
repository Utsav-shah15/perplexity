const express = require("express");
const router = express.Router();
const authUser = require("../middleware/auth.middleware");
const upload = require("../config/multer.config");
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  searchDocuments,
} = require("../controllers/document.controller");


router.post("/upload", authUser, upload.single("file"), uploadDocument);
router.get("/documents", authUser, getDocuments);
router.delete("/documents/:docId", authUser, deleteDocument);
router.get("/search", authUser, searchDocuments);

module.exports = router;