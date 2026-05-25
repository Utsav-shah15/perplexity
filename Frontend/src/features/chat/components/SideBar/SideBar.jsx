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
  Cloud
} from "lucide-react";
import {useSelector} from "react-redux";
import { useDispatch } from "react-redux";

export default function Sidebar() {
  const chats=useSelector(state=>state.chat.chats);
  return (
    <div className="w-[260px] h-screen bg-[#1c1b22] border-r border-black/20 flex flex-col justify-between py-4 px-3">
      <div>
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

        <button className="w-full bg-[#2a2836] hover:bg-[#343142] text-[#d4d4d8] py-2.5 rounded-xl flex items-center gap-2 px-4 font-medium mb-6 transition-colors shadow-sm text-sm">
          <Plus size={18} />
          New Chat
        </button>

        <div className="space-y-0.5">
          <SidebarItem icon={<Home size={18} />} label="Home" active />
          <SidebarItem icon={<Compass size={18} />} label="Discover" />
          <SidebarItem icon={<Bot size={18} />} label="Agents" />
          <SidebarItem icon={<History size={18} />} label="History" />
        </div>

        <div className="mt-8">
          <h3 className="text-[10px] font-bold text-[#71717a] tracking-[0.1em] mb-3 px-3 uppercase">Recent</h3>
          <div className="space-y-0.5">
            {Object.values(chats).map((chat) => (
                <SidebarItem
                    key={chat.id}
                    chatId={chat.id}
                    icon={<MessageSquare size={16} />}
                    label={chat.title}
                />
              ))}
          </div>
        </div>
      </div>

      <div>
        <div className="space-y-0.5">
          <SidebarItem icon={<Settings size={18} />} label="Settings" />
          <SidebarItem icon={<Layout size={18} />} label="Workspace" />
          <SidebarItem icon={<Library size={18} />} label="Library" />
        </div>
      </div>
    </div>
  );
}