import { Star, Users, Bell, Settings, User } from "lucide-react";

export default function TopNavigationBar() {
  return (
    <div className="h-14 px-6 flex items-center justify-between bg-[#0f0e15] border-b border-[#1f1d2b]">

      {/* Left Side: Title */}
      <div className="flex items-center gap-4 text-[15px] font-medium">
        <span className="text-[#f3f3f3] font-bold">Aura AI</span>
        <span className="text-[#71717a]">New Chat</span>
      </div>

      {/* Right Side: Icons */}
      <div className="flex items-center gap-5 text-[#a1a1aa]">
        <button className="hover:text-white transition-colors">
          <Star size={18} />
        </button>
        <button className="hover:text-white transition-colors">
          <Users size={18} />
        </button>
        <button className="hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <button className="hover:text-white transition-colors">
          <Settings size={18} />
        </button>
        <button className="w-6 h-6 rounded-full bg-blue-500 overflow-hidden flex items-center justify-center">
          <img src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" alt="User Avatar" className="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  );
}