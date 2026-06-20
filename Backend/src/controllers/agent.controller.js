const Agent = require("../models/agent.model");
const Workspace = require("../models/workspace.model");

// Pre-configured system agents
const systemAgents = [
  {
    name: "Aura Assistant",
    code: "aura_assistant",
    description: "General-purpose conversational assistant with web search and knowledge base capabilities.",
    systemPrompt: "You are Aura Assistant, a highly helpful, intelligent, and general-purpose conversational assistant. You have access to Web Search and Knowledge Base tools to help users answer their queries precisely and efficiently. When the user mentions or asks about an uploaded file, document, resume, or photo (e.g. using phrases like 'explain this photo', 'what is this image', 'show my file', etc.), you MUST immediately call the searchKnowledgeBase tool to retrieve its contents or visual descriptions. Do NOT ask the user for clarification before calling the searchKnowledgeBase tool. Maintain a professional, friendly, and structured communication style.",
    tools: ["web_search", "knowledge_base"],
    icon: "✨",
    color: "#9d89ff",
    isSystem: true,
  },
  {
    name: "Aura Coder",
    code: "aura_coder",
    description: "Elite software engineer. Specializes in writing, reviewing, refactoring, and debugging code across any programming language.",
    systemPrompt: "You are Aura Coder, an elite software engineering assistant. Your specialty is writing, reviewing, refactoring, and debugging code across any programming language (Python, Javascript, Rust, C++, etc.). Provide clean, production-ready code blocks, point out edge cases, and follow industry best practices.",
    tools: ["web_search"],
    icon: "💻",
    color: "#10b981",
    isSystem: true,
  },
  {
    name: "Aura Researcher",
    code: "aura_researcher",
    description: "In-depth scientific and market researcher. Synthesizes reports, crawls the web, and reads knowledge documents.",
    systemPrompt: "You are Aura Researcher, an expert research analyst. You specialize in conducting in-depth scientific, technical, or market research. You have access to Web Search and the searchKnowledgeBase tool (which allows you to search files uploaded by the user). Synthesize long reports, summarize key findings, extract academic concepts, and cite your information accurately. When the user asks about their uploaded documents or photos (e.g. using phrases like 'explain this photo', 'read my document', etc.), you MUST immediately call the searchKnowledgeBase tool to retrieve its contents or visual descriptions. Do NOT ask the user for clarification before calling the searchKnowledgeBase tool.",
    tools: ["web_search", "knowledge_base"],
    icon: "🔍",
    color: "#14b8a6",
    isSystem: true,
  },
  {
    name: "Aura Data Analyst",
    code: "aura_data_analyst",
    description: "Analytical expert. Processes data, optimizes database queries, generates formulas, and builds stats descriptions.",
    systemPrompt: "You are Aura Data Analyst, a specialist in data processing, query optimization, and statistical analysis. Your expertise lies in analyzing tabular datasets, writing high-performance SQL, crafting formulas (Excel/Google Sheets), and summarizing statistical trends.",
    tools: ["web_search"],
    icon: "📊",
    color: "#3b82f6",
    isSystem: true,
  },
  {
    name: "Aura UI Generator",
    code: "aura_ui_generator",
    description: "Sleek frontend designer. Generates premium, modern React components and HTML/CSS mockups with vibrant styles.",
    systemPrompt: "You are Aura UI Generator, a world-class frontend designer and developer. You generate modern, beautiful, and highly responsive UI mockups and React components. Use TailwindCSS, custom HSL color systems, and modern visual patterns like glassmorphism. Focus heavily on rich aesthetics and smooth layout flows.",
    tools: [],
    icon: "🎨",
    color: "#ec4899",
    isSystem: true,
  },
  {
    name: "Aura Resume Reviewer",
    code: "aura_resume_reviewer",
    description: "Career coach AI. Critiques resumes, prepares interview prep strategies, and refines job descriptions.",
    systemPrompt: "You are Aura Resume Reviewer, a veteran technical recruiter and career coach. You have access to the searchKnowledgeBase tool. When the user asks you to review, read, check, analyze, or critique their resume (or any uploaded file/document/photo), you MUST immediately call the searchKnowledgeBase tool to fetch the resume contents or image descriptions. Do NOT ask the user for clarification before calling the searchKnowledgeBase tool. Then, provide a comprehensive critique, point out areas of improvement, and help them align their experience with jobs.",
    tools: ["knowledge_base"],
    icon: "🧠",
    color: "#f59e0b",
    isSystem: true,
  },
  {
    name: "Aura System Designer",
    code: "aura_system_designer",
    description: "System architect. Designs high-scale distributed backend systems, databases, APIs, and microservice architectures.",
    systemPrompt: "You are Aura System Designer, a principal systems architect. You specialize in designing high-scale distributed backends, complex databases, RESTful/GraphQL APIs, messaging queues, and microservices. Draw clear ASCII architectural diagrams and explain scaling strategies (caching, partition keys, load balancers).",
    tools: ["web_search"],
    icon: "🚀",
    color: "#6366f1",
    isSystem: true,
  },
];

// Helper to seed system agents if they don't exist
async function seedSystemAgents() {
  try {
    const validCodes = systemAgents.map((a) => a.code);
    // Remove outdated system agents
    await Agent.deleteMany({ isSystem: true, code: { $nin: validCodes } });

    for (const agentData of systemAgents) {
      const exists = await Agent.findOne({ code: agentData.code });
      if (!exists) {
        await Agent.create(agentData);
        console.log(`Seeded system agent: ${agentData.name}`);
      } else {
        await Agent.updateOne({ code: agentData.code }, agentData);
      }
    }
  } catch (error) {
    console.error("Error seeding system agents:", error);
  }
}

// GET /agents/marketplace
async function getMarketplaceAgents(req, res) {
  try {
    // Seed on demand to guarantee existence
    await seedSystemAgents();

    // Find all system agents OR custom agents created by this user
    const agents = await Agent.find({
      $or: [{ isSystem: true }, { user: req.user.id }],
    }).sort({ isSystem: -1, createdAt: -1 });

    res.status(200).json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /agents - Create a custom agent
async function createCustomAgent(req, res) {
  try {
    const { name, description, systemPrompt, tools, icon, color } = req.body;

    if (!name || !systemPrompt) {
      return res.status(400).json({ success: false, message: "Name and System Prompt are required" });
    }

    const newAgent = await Agent.create({
      name,
      description: description || "",
      systemPrompt,
      tools: tools || [],
      icon: icon || "🤖",
      color: color || "#3b82f6",
      isSystem: false,
      user: req.user.id,
    });

    res.status(201).json({ success: true, agent: newAgent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /workspaces/:workspaceId/agents/:agentId - Deploy an agent to workspace
async function deployAgentToWorkspace(req, res) {
  try {
    const { workspaceId, agentId } = req.params;

    // Check workspace permission (owner/editor)
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const member = workspace.members.find(m => m.user.toString() === req.user.id);
    const isOwner = workspace.owner.toString() === req.user.id;

    if (!isOwner && (!member || (member.role !== "owner" && member.role !== "editor"))) {
      return res.status(403).json({ success: false, message: "You don't have permission to deploy agents in this workspace" });
    }

    // Check if agent exists
    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // Check if already deployed
    if (workspace.deployedAgents.includes(agentId)) {
      return res.status(400).json({ success: false, message: "Agent is already deployed in this workspace" });
    }

    workspace.deployedAgents.push(agentId);
    await workspace.save();

    res.status(200).json({ success: true, message: "Agent deployed successfully", workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /workspaces/:workspaceId/agents/:agentId - Undeploy an agent from workspace
async function undeployAgentFromWorkspace(req, res) {
  try {
    const { workspaceId, agentId } = req.params;

    // Check workspace permission (owner/editor)
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    const member = workspace.members.find(m => m.user.toString() === req.user.id);
    const isOwner = workspace.owner.toString() === req.user.id;

    if (!isOwner && (!member || (member.role !== "owner" && member.role !== "editor"))) {
      return res.status(403).json({ success: false, message: "You don't have permission to modify agents in this workspace" });
    }

    workspace.deployedAgents = workspace.deployedAgents.filter(id => id.toString() !== agentId);
    await workspace.save();

    res.status(200).json({ success: true, message: "Agent undeployed successfully", workspace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getMarketplaceAgents,
  createCustomAgent,
  deployAgentToWorkspace,
  undeployAgentFromWorkspace,
};
