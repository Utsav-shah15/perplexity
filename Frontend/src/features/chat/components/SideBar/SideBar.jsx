import SidebarItem from "./SideBarItem";
import {
  Home,
  Compass,
  Bot,
  History,
  MessageSquare,
  Settings,
  Layout,
  Library,
  Plus,
  Cloud,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentChatId } from "../../chat.slice";
import { setActiveWorkspaceId } from "../../../workspace/workspace.slice";

export default function Sidebar({ activeView, onNavigate, onOpenWorkspaceDetail }) {
  const dispatch = useDispatch();
  const { chats, currentChatId } = useSelector((state) => state.chat);
  const { activeWorkspaceId, workspaces } = useSelector((state) => state.workspace);

  // Find active workspace details
  const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId);

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
    dispatch(setActiveWorkspaceId(null)); // Clear active workspace context for global chats
    onNavigate("chat");
  };

  const handleChatClick = (chatId) => {
    onNavigate("chat");
  };

  return (
    <div className="w-[260px] h-screen bg-[#0b0a0f] border-r border-[#1d1b26] flex flex-col py-5 px-4 overflow-hidden select-none">

      {/* Fixed Top Section */}
      <div className="shrink-0">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 mb-6 px-1 mt-1">
          <div className="bg-[#9d89ff]/10 p-2 rounded-xl flex items-center justify-center border border-[#9d89ff]/20">
            <Cloud size={18} className="text-[#9d89ff]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#f3f3f3] leading-tight font-sans tracking-wide">
              Aura AI
            </h1>
            <p className="text-[10px] text-[#71717a] font-medium">Workspace Assistant</p>
          </div>
        </div>

        {/* Active Workspace Badge */}
        {activeWorkspace && (
          <button
            onClick={() => onOpenWorkspaceDetail && onOpenWorkspaceDetail(activeWorkspaceId)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 mb-4 rounded-xl bg-[#15131c] border border-[#252233] hover:border-[#9d89ff]/30 transition-all cursor-pointer group"
          >
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ backgroundColor: activeWorkspace.color + "15", color: activeWorkspace.color }}
            >
              {activeWorkspace.icon}
            </span>
            <span className="text-[12px] text-[#e4e4e7] group-hover:text-white truncate transition-colors font-medium">
              {activeWorkspace.name}
            </span>
          </button>
        )}

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full bg-[#9d89ff] hover:bg-[#8b75ff] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 px-4 font-semibold mb-6 transition-all shadow-md shadow-[#9d89ff]/10 text-sm cursor-pointer"
        >
          <Plus size={16} />
          New Chat
        </button>

        {/* Navigation Links */}
        <div className="space-y-1 mb-6">
          <SidebarItem
            icon={<Home size={18} />}
            label="Home"
            active={activeView === "chat" && !currentChatId}
            onClick={() => { 
              dispatch(setCurrentChatId(null)); 
              dispatch(setActiveWorkspaceId(null)); // Clear active workspace context for home/personal chats
              onNavigate("chat"); 
            }}
          />
          <SidebarItem 
            icon={<Bot size={18} />} 
            label="Agents" 
            active={activeView === "agents"}
            onClick={() => onNavigate("agents")}
          />
          <SidebarItem 
            icon={<History size={18} />} 
            label="History" 
            active={activeView === "history"}
            onClick={() => onNavigate("history")}
          />
          <SidebarItem
            icon={<Layout size={18} />}
            label="Workspaces"
            active={activeView === "workspace" || activeView === "workspace-detail"}
            onClick={() => onNavigate("workspace")}
          />
          <SidebarItem
            icon={<Library size={18} />}
            label="Knowledge Base"
            active={activeView === "knowledge"}
            onClick={() => onNavigate("knowledge")}
          />
        </div>
      </div>

      {/* Scrollable Recents list */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin mb-4">
        <div>
          <h3 className="text-[9px] font-bold text-[#4c4961] tracking-[0.12em] mb-3 px-3 uppercase">
            Recent Chats
          </h3>
          <div className="space-y-1">
            {Object.values(chats)
              .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
              .slice(0, 15) // Keep it neat
              .map((chat) => (
                <SidebarItem
                  key={chat.id}
                  chatId={chat.id}
                  icon={<MessageSquare size={15} />}
                  label={chat.title}
                  active={activeView === "chat" && chat.id === currentChatId}
                  onClick={() => onNavigate("chat")}
                  workspace={chat.workspace}
                />
              ))}
          </div>
        </div>
      </div>

    </div>
  );
}