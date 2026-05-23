import { Lightbulb, PenTool, Bug, Compass } from "lucide-react";
import ChatInputBar from "./ChatInputBar";
import { useState } from "react";

export default function ChatContainer() {

  const [messages,setMessages]=useState([]);

  const handlechatMessage=({message,chatId})=>{
    setMessages((prev)=>[...prev,{content:message,role:"user"}]);
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f0e15] relative">

      {/* Main Centered Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-10 mt-[-2vh]">
          <h1 className="text-[52px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9d89ff] via-[#d4adff] to-[#ffb1d9] mb-4 tracking-tight drop-shadow-[0_0_20px_rgba(157,137,255,0.3)]">
            Aura AI
          </h1>
          <p className="text-[#a1a1aa] text-[15px] max-w-lg mx-auto leading-relaxed">
            Your intelligent workspace for development, research, and creativity.
          </p>
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-[700px] w-full mb-10">
          
          <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all group flex flex-col gap-3 h-[110px]">
            <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">Explain Concepts</h3>
              <p className="text-[#71717a] text-[13px]">Break down complex technical topics.</p>
            </div>
          </button>

          <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all group flex flex-col gap-3 h-[110px]">
            <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
              <PenTool size={18} />
            </div>
            <div>
              <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">Generate UI</h3>
              <p className="text-[#71717a] text-[13px]">Create high-end interfaces in seconds.</p>
            </div>
          </button>

          <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all group flex flex-col gap-3 h-[110px]">
            <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
              <Bug size={18} />
            </div>
            <div>
              <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">Debug Code</h3>
              <p className="text-[#71717a] text-[13px]">Fix issues across any programming language.</p>
            </div>
          </button>

          <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all group flex flex-col gap-3 h-[110px]">
            <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">Architecture Review</h3>
              <p className="text-[#71717a] text-[13px]">Validate system designs and flows.</p>
            </div>
          </button>
          
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 max-w-4xl mx-auto w-full mb-6">
        <ChatInputBar onsend={handlechatMessage}/>
      </div>

    </div>
  );
}