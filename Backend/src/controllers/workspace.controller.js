const Workspace = require("../models/workspace.model");
const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");

// Create a new workspace
async function createWorkspace(req, res) {
  try {
    const { name, description, color, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description || "",
      color: color || "#9d89ff",
      icon: icon || "💼",
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "owner",
        },
      ],
    });

    res.status(201).json({ workspace });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Error creating workspace", error: error.message });
  }
}

// Get all workspaces for current user
async function getWorkspaces(req, res) {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user.id,
    })
      .populate("owner", "username email avatar")
      .populate("members.user", "username email avatar");

    res.status(200).json({ workspaces });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workspaces", error: error.message });
  }
}

// Get single workspace
async function getWorkspace(req, res) {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    })
      .populate("owner", "username email avatar")
      .populate("members.user", "username email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json({ workspace });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workspace", error: error.message });
  }
}

// Update workspace (owner/editor only)
async function updateWorkspace(req, res) {
  try {
    const { workspaceId } = req.params;
    const { name, description, color, icon, customInstructions } = req.body;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check role — only owner/editor can update
    const member = workspace.members.find(
      (m) => m.user.toString() === req.user.id
    );
    if (!member || member.role === "viewer") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    if (name) workspace.name = name.trim();
    if (description !== undefined) workspace.description = description;
    if (color) workspace.color = color;
    if (icon) workspace.icon = icon;
    if (customInstructions !== undefined) workspace.customInstructions = customInstructions;

    await workspace.save();
    
    const populated = await Workspace.findById(workspace._id)
      .populate("owner", "username email avatar")
      .populate("members.user", "username email avatar");

    res.status(200).json({ workspace: populated });
  } catch (error) {
    res.status(500).json({ message: "Error updating workspace", error: error.message });
  }
}

// Delete workspace (owner only)
async function deleteWorkspace(req, res) {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found or not owner" });
    }

    // Delete all chats and messages in this workspace
    const chats = await Chat.find({ workspace: workspaceId });
    const chatIds = chats.map((c) => c._id);
    await Message.deleteMany({ chat: { $in: chatIds } });
    await Chat.deleteMany({ workspace: workspaceId });
    await Workspace.findByIdAndDelete(workspaceId);

    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting workspace", error: error.message });
  }
}

// Invite a member by email
async function inviteMember(req, res) {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found or not owner" });
    }

    const userToInvite = await User.findOne({ email: email.toLowerCase() });
    if (!userToInvite) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Check if already a member
    const existing = workspace.members.find(
      (m) => m.user.toString() === userToInvite._id.toString()
    );
    if (existing) {
      return res.status(400).json({ message: "User is already a member" });
    }

    workspace.members.push({
      user: userToInvite._id,
      role: role || "viewer",
    });

    await workspace.save();

    const populated = await Workspace.findById(workspace._id)
      .populate("owner", "username email avatar")
      .populate("members.user", "username email avatar");

    res.status(200).json({ message: "Member invited successfully", workspace: populated });
  } catch (error) {
    res.status(500).json({ message: "Error inviting member", error: error.message });
  }
}

// Remove a member (owner only)
async function removeMember(req, res) {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found or not owner" });
    }

    // Can't remove the owner
    if (userId === req.user.id) {
      return res.status(400).json({ message: "Cannot remove yourself as owner" });
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== userId
    );

    await workspace.save();
    
    const populated = await Workspace.findById(workspace._id)
      .populate("owner", "username email avatar")
      .populate("members.user", "username email avatar");

    res.status(200).json({ message: "Member removed", workspace: populated });
  } catch (error) {
    res.status(500).json({ message: "Error removing member", error: error.message });
  }
}

// Get chats for a workspace
async function getWorkspaceChats(req, res) {
  try {
    const { workspaceId } = req.params;

    // Verify membership
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const chats = await Chat.find({ workspace: workspaceId }).sort({ updatedAt: -1 });
    res.status(200).json({ chats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching workspace chats", error: error.message });
  }
}

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  getWorkspaceChats,
};
