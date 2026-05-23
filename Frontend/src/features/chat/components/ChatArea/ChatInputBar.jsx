import { ArrowUp, Paperclip, Mic, Zap, Globe } from "lucide-react";
import { useState } from "react";

export default function ChatInputBar({ onsend }) {
  const [input, setInput] = useState("");

  const handleMessage = () => {
    if (input.trim() === "") return;
    onsend({ message: input, chatId: "temp-id" });
    setInput("");
  }

  return (
    <div className="bg-[#211d33] border border-[#342e4d] rounded-2xl p-2 shadow-2xl flex flex-col gap-2">

      {/* Top action bar */}
      <div className="flex items-center gap-4 px-3 pt-1 text-[13px] text-[#a1a1aa] font-medium">
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Zap size={14} />
          <span>Aura-4 Turbo</span>
          ``    <span className="text-[10px] ml-0.5 opacity-50">▼</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Globe size={14} />
          <span>Search</span>
        </button>
      </div>

      {/* Input area */}
      <div className="bg-[#191626] rounded-xl flex items-center px-2 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleMessage();
          }}
          placeholder="Message Aura AI..."
          className="flex-1 bg-transparent outline-none text-[#e4e4e7] text-[15px] placeholder-[#71717a] px-3 h-10"
        />

        <div className="flex items-center gap-2 pr-1">
          <button className="text-[#a1a1aa] hover:text-white transition-colors p-1.5 rounded-lg">
            <Paperclip size={18} />
          </button>
          <button className="text-[#a1a1aa] hover:text-white transition-colors p-1.5 rounded-lg">
            <Mic size={18} />
          </button>
          <button 
            onClick={handleMessage}
            className="bg-[#e4dcfb] hover:bg-[#d6c9fa] text-[#6d28d9] w-9 h-9 rounded-xl flex items-center justify-center transition-colors ml-1 shadow-sm"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

    </div>
  );
}