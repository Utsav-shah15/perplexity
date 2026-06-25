import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Search, Trash2, MessageSquare, Calendar, Folder, User } from "lucide-react";
import { setCurrentChatId } from "../../chat.slice";
import { setActiveWorkspaceId } from "../../../workspace/workspace.slice";
import { useChat } from "../../hooks/useChat";

export default function HistoryPage({ onOpenChat }) {
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chat);
  const { workspaces } = useSelector((state) => state.workspace);
  const { handleDeleteChat, handleGetMessages } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");

  const chatList = Object.values(chats).sort(
    (a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
  );

  const filteredChats = chatList.filter((chat) => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Resolve workspace id
    const chatWorkspaceId = chat.workspace && typeof chat.workspace === "object"
      ? chat.workspace._id
      : chat.workspace;

    const matchesWorkspace =
      selectedWorkspace === "all" ||
      (selectedWorkspace === "personal" && !chatWorkspaceId) ||
      chatWorkspaceId === selectedWorkspace;

    return matchesSearch && matchesWorkspace;
  });

  const handleOpenChat = async (chatId, workspace) => {
    dispatch(setCurrentChatId(chatId));
    const wsId = workspace && typeof workspace === "object" ? workspace._id : workspace;
    if (wsId) {
      dispatch(setActiveWorkspaceId(wsId));
    } else {
      dispatch(setActiveWorkspaceId(null));
    }
    await handleGetMessages(chatId);
    if (onOpenChat) onOpenChat();
  };

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await handleDeleteChat(chatId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0e15] overflow-y-auto px-8 py-8 min-h-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f3f3f3] mb-2 flex items-center gap-3">
          <MessageSquare className="text-[#9d89ff] w-6 h-6" />
          Chat History
        </h1>
        <p className="text-sm text-[#71717a]">
          View, search, and manage your past conversations.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search chat sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#15131c] border border-[#252233] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#e4e4e7] placeholder-[#71717a] outline-none focus:border-[#9d89ff]/50 transition-all"
          />
        </div>

        {/* Workspace Filter */}
        <div className="flex gap-2 min-w-[200px]">
          <select
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            className="w-full bg-[#15131c] border border-[#252233] rounded-xl px-4 py-2.5 text-sm text-[#e4e4e7] outline-none focus:border-[#9d89ff]/50 cursor-pointer"
          >
            <option value="all">All Workspaces</option>
            <option value="personal">Personal Chats</option>
            {workspaces.map((ws) => (
              <option key={ws._id} value={ws._id}>
                {ws.icon} {ws.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chats Grid */}
      {filteredChats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-[#252233] rounded-2xl bg-[#15131c]/20">
          <MessageSquare size={48} className="text-[#3d3a50] mb-4" />
          <p className="text-sm text-[#71717a]">No matching conversations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChats.map((chat) => {
            const chatWorkspace = chat.workspace;
            const wsName = chatWorkspace && typeof chatWorkspace === "object" ? chatWorkspace.name : "";
            const wsIcon = chatWorkspace && typeof chatWorkspace === "object" ? chatWorkspace.icon : "";
            const wsColor = chatWorkspace && typeof chatWorkspace === "object" ? chatWorkspace.color : "#9d89ff";

            return (
              <div
                key={chat.id}
                onClick={() => handleOpenChat(chat.id, chat.workspace)}
                className="group relative bg-[#15131c] border border-[#252233] hover:border-[#9d89ff]/30 rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  {/* Category/Workspace tag */}
                  <div className="flex items-center justify-between mb-3 min-w-0">
                    {chatWorkspace ? (
                      <span
                        className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full flex items-center gap-1.5"
                        style={{ backgroundColor: wsColor + "15", color: wsColor }}
                      >
                        <span>{wsIcon}</span>
                        <span className="truncate max-w-[100px]">{wsName}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/5 text-[#a1a1aa] flex items-center gap-1.5">
                        <User size={10} />
                        Personal
                      </span>
                    )}

                    {/* Agent tag if applicable */}
                    {chat.agent && (
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#9d89ff]/10 text-[#9d89ff] truncate max-w-[100px]">
                        {chat.agent.name || "Agent"}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-[#f3f3f3] group-hover:text-white line-clamp-2 leading-snug mb-3">
                    {chat.title}
                  </h3>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#1e1d26]">
                  <span className="text-[10px] text-[#71717a] flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(chat.lastUpdated)}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="p-1.5 text-[#71717a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
