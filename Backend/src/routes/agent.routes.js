const express = require("express");
const router = express.Router();
const authUser = require("../middleware/auth.middleware");
const {
  getMarketplaceAgents,
  createCustomAgent,
  deployAgentToWorkspace,
  undeployAgentFromWorkspace,
} = require("../controllers/agent.controller");

// Marketplace & Custom Agent creation
router.get("/marketplace", authUser, getMarketplaceAgents);
router.post("/", authUser, createCustomAgent);

// Workspace deployment
router.post("/workspaces/:workspaceId/deploy/:agentId", authUser, deployAgentToWorkspace);
router.delete("/workspaces/:workspaceId/deploy/:agentId", authUser, undeployAgentFromWorkspace);

module.exports = router;
