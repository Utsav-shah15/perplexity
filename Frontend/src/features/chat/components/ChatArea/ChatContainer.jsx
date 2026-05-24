import {
  Lightbulb,
  PenTool,
  Bug,
  Compass,
} from "lucide-react";

import ChatInputBar from "./ChatInputBar";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";

export default function ChatContainer() {
  const { handlechatMessage } = useChat();
  const { chats, currentChatId } = useSelector(
    (state) => state.chat
  );

  const currentChat = chats[currentChatId];
  const messages = currentChat?.messages || [];
  const bottomRef = useRef(null);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleMessage = async ({ message }) => {
    await handlechatMessage({
      message,
      chatId: currentChatId,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0e15] relative overflow-hidden">

      {/* CHAT MODE */}
      {messages.length > 0 ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* AI MESSAGE */}
                  {msg.role === "ai" && (
                    <div className="flex gap-4 max-w-full">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-[#1d1b28] border border-[#2a2638] flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-sm">✨</span>
                      </div>
                      {/* Message */}
                      <div className="bg-[#17151f] border border-[#252233] rounded-2xl px-5 py-4 text-[#e4e4e7] text-[15px] leading-7 max-w-[850px] shadow-[0_0_30px_rgba(0,0,0,0.25)]">
                        <p className="whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* USER MESSAGE */}
                  {msg.role === "user" && (
                    <div className="bg-gradient-to-br from-[#9d89ff] to-[#7c67ff] text-white px-5 py-4 rounded-2xl max-w-[700px] text-[15px] leading-7 shadow-[0_0_25px_rgba(157,137,255,0.25)] border border-[#a593ff33]">
                      <p className="whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        </>

      ) : (

        /* EMPTY STATE */
        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">

          {/* Hero */}
          <div className="text-center mb-10 mt-[-2vh]">

            <h1 className="text-[52px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9d89ff] via-[#d4adff] to-[#ffb1d9] mb-4 tracking-tight drop-shadow-[0_0_20px_rgba(157,137,255,0.3)]">
              Aura AI
            </h1>

            <p className="text-[#a1a1aa] text-[15px] max-w-lg mx-auto leading-relaxed">
              Your intelligent workspace for development,
              research, and creativity.
            </p>

          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-2 gap-4 max-w-[700px] w-full mb-10">

            {/* Card */}
            <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all duration-200 group flex flex-col gap-3 h-[110px]">

              <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
                <Lightbulb size={18} />
              </div>

              <div>
                <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">
                  Explain Concepts
                </h3>

                <p className="text-[#71717a] text-[13px]">
                  Break down complex technical topics.
                </p>
              </div>

            </button>

            {/* Card */}
            <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all duration-200 group flex flex-col gap-3 h-[110px]">

              <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
                <PenTool size={18} />
              </div>

              <div>
                <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">
                  Generate UI
                </h3>

                <p className="text-[#71717a] text-[13px]">
                  Create high-end interfaces in seconds.
                </p>
              </div>

            </button>

            {/* Card */}
            <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all duration-200 group flex flex-col gap-3 h-[110px]">

              <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
                <Bug size={18} />
              </div>

              <div>
                <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">
                  Debug Code
                </h3>

                <p className="text-[#71717a] text-[13px]">
                  Fix issues across any programming language.
                </p>
              </div>

            </button>

            {/* Card */}
            <button className="bg-[#15131c] hover:bg-[#1a1823] border border-[#252233] p-5 rounded-[18px] text-left transition-all duration-200 group flex flex-col gap-3 h-[110px]">

              <div className="bg-[#242131] w-8 h-8 rounded-lg flex items-center justify-center text-[#d4bfff] group-hover:text-white transition-colors">
                <Compass size={18} />
              </div>

              <div>
                <h3 className="text-[#e4e4e7] text-sm font-semibold mb-0.5">
                  Architecture Review
                </h3>

                <p className="text-[#71717a] text-[13px]">
                  Validate system designs and flows.
                </p>
              </div>

            </button>

          </div>

        </div>
      )}

      {/* INPUT */}
      <div className="px-4 max-w-4xl mx-auto w-full pb-6 pt-2">
        <ChatInputBar onsend={handleMessage} />
      </div>

    </div>
  );
}