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
import { useState } from "react";
import KnowledgeBasePanel from "../../../knowledge/components/KnowledgeBasePanel";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { chats, currentChatId } = useSelector((state) => state.chat);
  const [showKnowledge, setShowKnowledge] = useState(false);

  return (
    <>
      {/* Knowledge Base Modal */}
      {showKnowledge && (
        <KnowledgeBasePanel onClose={() => setShowKnowledge(false)} />
      )}

      <div className="w-[260px] h-screen bg-[#1c1b22] border-r border-black/20 flex flex-col py-4 px-3 overflow-hidden select-none">

        {/* Fixed Top Section */}
        <div className="shrink-0">
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 mb-6 px-2 mt-1">
            <div className="bg-[#e4dcfb] p-1.5 rounded-lg flex items-center justify-center">
              <Cloud size={20} className="text-[#6d28d9] fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#f3f3f3] leading-tight font-sans">
                Aura AI
              </h1>
              <p className="text-[11px] text-[#8e8e93] font-medium">AI Assistant</p>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => dispatch(setCurrentChatId(null))}
            className="w-full bg-[#2a2836] hover:bg-[#343142] text-[#d4d4d8] py-2.5 rounded-xl flex items-center gap-2 px-4 font-medium mb-6 transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            New Chat
          </button>

          {/* Navigation Links */}
          <div className="space-y-0.5 mb-6">
            <SidebarItem icon={<Home size={18} />} label="Home" active={!currentChatId} />
            <SidebarItem icon={<Compass size={18} />} label="Discover" />
            <SidebarItem icon={<Bot size={18} />} label="Agents" />
            <SidebarItem icon={<History size={18} />} label="History" />
          </div>
        </div>

        {/* Scrollable Recents list */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin mb-4">
          <div>
            <h3 className="text-[10px] font-bold text-[#71717a] tracking-[0.1em] mb-3 px-3 uppercase">
              Recent
            </h3>
            <div className="space-y-0.5">
              {Object.values(chats)
                .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0))
                .map((chat) => (
                  <SidebarItem
                    key={chat.id}
                    chatId={chat.id}
                    icon={<MessageSquare size={16} />}
                    label={chat.title}
                    active={chat.id === currentChatId}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Fixed Sidebar Footer */}
        <div className="mt-auto pt-4 border-t border-[#2e2b3c] shrink-0">
          <div className="space-y-0.5">
            <SidebarItem icon={<Settings size={18} />} label="Settings" />
            <SidebarItem icon={<Layout size={18} />} label="Workspace" />
            {/* Library opens the Knowledge Base panel */}
            <SidebarItem
              icon={<Library size={18} />}
              label="Knowledge Base"
              onClick={() => setShowKnowledge(true)}
            />
          </div>
        </div>

      </div>
    </>
  );
}