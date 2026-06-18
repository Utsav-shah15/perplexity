const { Router } = require("express");
const authUser = require("../middleware/auth.middleware");
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  getWorkspaceChats,
} = require("../controllers/workspace.controller");

const workspaceRouter = Router();

// CRUD
workspaceRouter.post("/", authUser, createWorkspace);
workspaceRouter.get("/", authUser, getWorkspaces);
workspaceRouter.get("/:workspaceId", authUser, getWorkspace);
workspaceRouter.patch("/:workspaceId", authUser, updateWorkspace);
workspaceRouter.delete("/:workspaceId", authUser, deleteWorkspace);

// Members
workspaceRouter.post("/:workspaceId/invite", authUser, inviteMember);
workspaceRouter.delete("/:workspaceId/members/:userId", authUser, removeMember);

// Workspace Chats
workspaceRouter.get("/:workspaceId/chats", authUser, getWorkspaceChats);

module.exports = workspaceRouter;
