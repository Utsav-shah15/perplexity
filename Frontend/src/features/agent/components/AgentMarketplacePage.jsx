import { useEffect, useState, useMemo } from "react";
import { useAgent } from "../hooks/useAgent";
import { useWorkspace } from "../../workspace/hooks/useWorkspace";
import { useDispatch } from "react-redux";
import { setCurrentChatId } from "../../chat/chat.slice";
import CreateAgentModal from "./CreateAgentModal";
import { 
  Bot, 
  Globe, 
  Database, 
  Plus, 
  ChevronDown, 
  Check, 
  MessageSquare,
  Sparkles,
  Search,
  Star,
  Cpu,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Layout,
  BookOpen,
  Code2
} from "lucide-react";

// Mock metadata for system agents to build a premium directory look
const AGENT_METADATA = {
  aura_assistant: { category: "Productivity", rating: "4.9", runs: "42.8k", featured: true },
  aura_coder: { category: "Coding", rating: "5.0", runs: "36.4k", featured: true },
  aura_researcher: { category: "Research", rating: "4.8", runs: "19.5k", featured: false },
  aura_data_analyst: { category: "Productivity", rating: "4.7", runs: "22.1k", featured: false },
  aura_ui_generator: { category: "Design", rating: "4.9", runs: "28.0k", featured: true },
  aura_resume_reviewer: { category: "Careers", rating: "4.6", runs: "9.2k", featured: false },
  aura_system_designer: { category: "Coding", rating: "4.9", runs: "14.3k", featured: false },
};

export default function AgentMarketplacePage({ onNavigate }) {
  const {
    agents,
    isLoading,
    handleGetMarketplace,
    handleCreateAgent,
    handleDeployAgent,
    handleUndeployAgent,
    selectAgent,
  } = useAgent();

  const { workspaces, handleGetWorkspaces } = useWorkspace();
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // agentId of open deploy dropdown
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    handleGetMarketplace();
    handleGetWorkspaces();
  }, [handleGetMarketplace, handleGetWorkspaces]);

  const handleStartChat = (agent) => {
    selectAgent(agent._id);
    dispatch(setCurrentChatId(null));
    onNavigate("chat");
  };

  const toggleDeployment = async (workspaceId, agent) => {
    const workspace = workspaces.find(w => w._id === workspaceId);
    if (!workspace) return;

    const isDeployed = workspace.deployedAgents?.includes(agent._id);
    if (isDeployed) {
      await handleUndeployAgent(workspaceId, agent._id);
    } else {
      await handleDeployAgent(workspaceId, agent._id);
    }
  };

  // Enrich agents with ratings, runs, and category tags
  const enrichedAgents = useMemo(() => {
    return agents.map(agent => {
      const meta = AGENT_METADATA[agent.code] || {
        category: agent.isSystem ? "General" : "Custom",
        rating: "New",
        runs: "0",
        featured: false
      };
      return { ...agent, ...meta };
    });
  }, [agents]);

  // Split into Featured vs Regular Directory
  const featuredAgents = useMemo(() => {
    return enrichedAgents.filter(a => a.featured);
  }, [enrichedAgents]);

  // Filtering based on Search & Category tabs
  const filteredDirectoryAgents = useMemo(() => {
    return enrichedAgents.filter(agent => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (agent.systemPrompt && agent.systemPrompt.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = 
        selectedCategory === "All" ||
        agent.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [enrichedAgents, searchQuery, selectedCategory]);

  return (
    <div className="flex-1 flex flex-col bg-[#0b0a0f] overflow-hidden min-h-0 relative">
      
      {/* Background visual glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#9d89ff]/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#ec4899]/3 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="flex-1 overflow-y-auto px-8 py-12 relative z-10 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* ========================================================================= */}
          {/* 1. TOP SECTION: Hero Header, Search & Description */}
          {/* ========================================================================= */}
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#9d89ff]/10 text-[#a593ff] mb-4 border border-[#9d89ff]/15">
                  <Sparkles size={12} />
                  Agent Marketplace
                </span>
                <h1 className="text-4xl font-extrabold text-[#f3f3f3] tracking-tight mb-3">
                  Discover, Deploy & Customise
                </h1>
                <p className="text-[#8e8d99] text-base leading-relaxed">
                  Power up your workspaces with specialized AI agents configured with dedicated system instructions, web lookup capabilities, and custom knowledge.
                </p>
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#9d89ff] to-[#7c67ff] hover:opacity-95 rounded-xl shadow-[0_0_20px_rgba(157,137,255,0.3)] transition-all duration-200 hover:scale-[1.02] cursor-pointer shrink-0"
              >
                <Plus size={16} />
                Create Custom Agent
              </button>
            </div>

            {/* Glassmorphic Search Bar */}
            <div className="relative max-w-xl group">
              <Search className="absolute left-4 top-3.5 text-[#5e5c6e] group-focus-within:text-[#9d89ff] transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search agents, capabilities, prompts or workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#13111c]/60 backdrop-blur-md border border-[#252233] text-[#e4e4e7] rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#9d89ff]/50 focus:ring-1 focus:ring-[#9d89ff]/30 transition-all shadow-inner placeholder-[#5e5c6e]"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. MIDDLE SECTION: Featured Agents */}
          {/* ========================================================================= */}
          {!searchQuery && selectedCategory === "All" && featuredAgents.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[#a593ff]" />
                <h2 className="text-lg font-bold text-[#e4e4e7] tracking-tight">Featured Agents</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredAgents.map((agent) => (
                  <div
                    key={agent._id}
                    className="relative bg-gradient-to-b from-[#181622] to-[#110f17] border border-[#272437] rounded-2xl p-6 hover:border-[#9d89ff]/40 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(157,137,255,0.15)] flex flex-col justify-between"
                  >
                    {/* Corner gradient glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#9d89ff]/5 to-transparent rounded-tr-2xl pointer-events-none" />

                    <div>
                      {/* Emoji Icon & Metrics */}
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/5"
                          style={{ backgroundColor: `${agent.color || "#3b82f6"}15` }}
                        >
                          {agent.icon || "🤖"}
                        </div>
                        
                        <div className="flex items-center gap-1 bg-[#1a1826] px-2 py-0.5 rounded-lg border border-[#272437] text-xs text-[#a1a1aa]">
                          <Star size={11} className="text-amber-400 fill-amber-400" />
                          <span className="font-semibold text-[#e4e4e7]">{agent.rating}</span>
                          <span className="text-[10px] text-[#71717a]">({agent.runs})</span>
                        </div>
                      </div>

                      {/* Title & Tag */}
                      <h3 className="text-[16px] font-bold text-[#f3f3f3] group-hover:text-[#9d89ff] transition-colors mb-1">
                        {agent.name}
                      </h3>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#9d89ff]/80 bg-[#9d89ff]/5 px-2 py-0.5 rounded border border-[#9d89ff]/10 mb-3">
                        {agent.category}
                      </span>

                      {/* Description */}
                      <p className="text-[#8e8d99] text-[13px] leading-relaxed mb-6 min-h-[56px] line-clamp-3">
                        {agent.description || "Core AI Assistant with premium dynamic prompts."}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-[#252233]/60 relative">
                      <button
                        onClick={() => handleStartChat(agent)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9d89ff] to-[#7c67ff] hover:opacity-90 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <MessageSquare size={13} />
                        Try Agent
                      </button>

                      {/* Dropdown container */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === agent._id ? null : agent._id)}
                          className="flex items-center justify-center p-2 text-[#a1a1aa] hover:text-[#e4e4e7] bg-[#1d1b28] border border-[#2d2a3f] rounded-xl hover:bg-[#252233] transition-all cursor-pointer"
                          title="Deploy to workspace"
                        >
                          <ChevronDown size={14} />
                        </button>

                        {activeDropdown === agent._id && (
                          <div className="absolute right-0 bottom-12 z-20 w-52 bg-[#14121a] border border-[#2c293c] rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                            <p className="text-[9px] font-bold text-[#71717a] uppercase tracking-wider px-2.5 py-2">
                              Deploy to Workspace
                            </p>
                            <div className="space-y-0.5 max-h-36 overflow-y-auto">
                              {workspaces.map((ws) => {
                                const isDeployed = ws.deployedAgents?.includes(agent._id);
                                return (
                                  <button
                                    key={ws._id}
                                    onClick={() => toggleDeployment(ws._id, agent)}
                                    className="w-full flex items-center justify-between px-2.5 py-2 text-[11px] text-[#e4e4e7] hover:bg-[#201e2c] rounded-lg transition-colors cursor-pointer"
                                  >
                                    <span className="truncate flex items-center gap-2">
                                      <span>{ws.icon || "💼"}</span>
                                      <span className="truncate">{ws.name}</span>
                                    </span>
                                    {isDeployed && <Check size={11} className="text-[#9d89ff]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. BOTTOM SECTION: Directory Filters & All Agents */}
          {/* ========================================================================= */}
          <div className="space-y-6 pt-2">
            
            {/* Category / Filtering Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#252233]/40 pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "Productivity", "Coding", "Research", "Design", "Custom"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#9d89ff]/10 text-[#9d89ff] border border-[#9d89ff]/20"
                        : "text-[#8e8d99] hover:text-[#e4e4e7] hover:bg-[#1a1826]/40 border border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="text-[#71717a] text-xs font-medium">
                Showing {filteredDirectoryAgents.length} agents
              </div>
            </div>

            {/* Directory Grid */}
            {isLoading && agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Cpu size={32} className="text-[#9d89ff] animate-spin" />
                <p className="text-[#71717a] text-xs">Loading marketplace directory...</p>
              </div>
            ) : filteredDirectoryAgents.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#252233] rounded-2xl">
                <Bot size={40} className="text-[#2c293c] mx-auto mb-3" />
                <p className="text-[#8e8d99] text-sm">No agents match your filter criteria</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="text-xs text-[#9d89ff] hover:underline mt-2 font-medium"
                >
                  Reset search filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDirectoryAgents.map((agent) => (
                  <div
                    key={agent._id}
                    className="flex justify-between items-start bg-[#12111a]/40 border border-[#221f30] rounded-xl p-5 hover:border-[#9d89ff]/20 transition-all hover:bg-[#12111a]/80 group"
                  >
                    <div className="flex gap-4 min-w-0 flex-1">
                      {/* Avatar */}
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border border-white/5"
                        style={{ backgroundColor: `${agent.color || "#3b82f6"}10` }}
                      >
                        {agent.icon || "🤖"}
                      </div>
                      
                      <div className="min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-[#e4e4e7] group-hover:text-white transition-colors truncate">
                            {agent.name}
                          </h4>
                          <span className="text-[9px] font-bold text-[#71717a] uppercase bg-[#1d1b28] px-1.5 py-0.5 rounded border border-[#2d2a3f]">
                            {agent.category}
                          </span>
                        </div>
                        
                        {/* Rating snippet */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[#71717a] mb-2">
                          <span className="flex items-center text-amber-500/80">
                            <Star size={10} className="fill-amber-500/80 mr-0.5" />
                            {agent.rating}
                          </span>
                          <span>·</span>
                          <span>{agent.runs} runs</span>
                        </div>

                        <p className="text-[#8e8d99] text-xs leading-relaxed line-clamp-2">
                          {agent.description || "Core engine agent with customized system prompt rules."}
                        </p>

                        {/* Capabilities tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {agent.tools?.includes("web_search") && (
                            <span className="flex items-center gap-1 text-[10px] text-[#3b82f6] bg-[#3b82f6]/5 px-2 py-0.5 rounded border border-[#3b82f6]/10">
                              <Globe size={10} />
                              Search
                            </span>
                          )}
                          {agent.tools?.includes("knowledge_base") && (
                            <span className="flex items-center gap-1 text-[10px] text-[#10b981] bg-[#10b981]/5 px-2 py-0.5 rounded border border-[#10b981]/10">
                              <Database size={10} />
                              Docs
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Trigger Buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0 relative">
                      <button
                        onClick={() => handleStartChat(agent)}
                        className="px-3.5 py-1.5 bg-[#1f1d2b] hover:bg-[#9d89ff] hover:text-white text-[#a1a1aa] rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                      >
                        Try
                        <ChevronRight size={12} />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === agent._id ? null : agent._id)}
                          className="w-full flex items-center justify-center p-1.5 bg-[#14121e]/80 hover:bg-[#201e2c] border border-[#252233] text-[#71717a] hover:text-[#e4e4e7] rounded-lg transition-colors cursor-pointer"
                        >
                          <ChevronDown size={12} />
                        </button>

                        {activeDropdown === agent._id && (
                          <div className="absolute right-0 bottom-8 z-20 w-48 bg-[#14121a] border border-[#2c293c] rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                            <p className="text-[9px] font-bold text-[#71717a] uppercase tracking-wider px-2 py-1">
                              Deploy to Workspace
                            </p>
                            <div className="space-y-0.5 max-h-36 overflow-y-auto">
                              {workspaces.map((ws) => {
                                const isDeployed = ws.deployedAgents?.includes(agent._id);
                                return (
                                  <button
                                    key={ws._id}
                                    onClick={() => toggleDeployment(ws._id, agent)}
                                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] text-[#e4e4e7] hover:bg-[#201e2c] rounded-lg transition-colors cursor-pointer"
                                  >
                                    <span className="truncate flex items-center gap-1.5">
                                      <span>{ws.icon || "💼"}</span>
                                      <span className="truncate">{ws.name}</span>
                                    </span>
                                    {isDeployed && <Check size={10} className="text-[#9d89ff]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
          
        </div>
      </div>

      <CreateAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateAgent}
      />
    </div>
  );
}
