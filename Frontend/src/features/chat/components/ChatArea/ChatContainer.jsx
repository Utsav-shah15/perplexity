import {
  Lightbulb,
  PenTool,
  Bug,
  Compass,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import ChatInputBar from "./ChatInputBar";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useChat } from "../../hooks/useChat";
import { useAgent } from "../../../agent/hooks/useAgent";
import { useKnowledge } from "../../../knowledge/hooks/useKnowledge";
import remarkGfm from "remark-gfm";

// ─── Copy Button for Code Blocks ────────────────────────────────────────────
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-[12px] text-[#71717a] hover:text-[#d4d4d8] transition-colors px-2 py-1 rounded-md hover:bg-white/5"
    >
      {copied ? (
        <>
          <Check size={12} className="text-green-400" />
          <span className="text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

// ─── Markdown Components ─────────────────────────────────────────────────────
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-white mt-6 mb-3 pb-2 border-b border-[#2a2638]">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-white mt-5 mb-2.5">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-[#d4bfff] mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-[#e4e4e7] mt-3 mb-1.5">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-[#c4c4c8] leading-7 mb-3 text-[15px]">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 pl-5 space-y-1.5 text-[#c4c4c8]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 pl-5 space-y-1.5 text-[#c4c4c8] list-decimal">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[15px] leading-6 relative pl-1 before:content-['•'] before:absolute before:-left-3.5 before:text-[#7c67ff]">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-[#d4bfff] italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#7c67ff] pl-4 py-1 my-3 bg-[#1a1726] rounded-r-lg text-[#a1a1aa] italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-[#2a2638] my-5" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#9d89ff] underline underline-offset-2 hover:text-[#c0b0ff] transition-colors"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-[#2a2638]">
      <table className="w-full text-[14px] text-[#c4c4c8]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#1a1726] text-[#d4bfff]">{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-[#2a2638] hover:bg-white/[0.02] transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="px-4 py-2.5">{children}</td>,

  // ── Code: inline vs block (react-markdown v10 compatible) ──
  code({ node, children, className, ...rest }) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match?.[1] || "";
    const isBlock = !!match || (node?.position?.start?.line !== node?.position?.end?.line);

    if (!isBlock) {
      return (
        <code
          className="bg-[#1e1b2e] text-[#d4bfff] px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-[#2a2638]"
          {...rest}
        >
          {children}
        </code>
      );
    }

    const codeString = String(children).replace(/\n$/, "");

    return (
      <div className="my-4 rounded-xl overflow-hidden border border-[#2a2638] shadow-lg">
        {/* Code block header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#13111c] border-b border-[#2a2638]">
          <span className="text-[12px] font-mono text-[#7c67ff] font-medium uppercase tracking-wider">
            {language || "code"}
          </span>
          <CopyButton code={codeString} />
        </div>
        {/* Syntax highlighted code */}
        <SyntaxHighlighter
          language={language || "text"}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: "#0d0b14",
            padding: "1.25rem",
            fontSize: "13px",
            lineHeight: "1.7",
          }}
          showLineNumbers={codeString.split("\n").length > 5}
          lineNumberStyle={{ color: "#3d3a50", minWidth: "2rem" }}
          wrapLongLines={false}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  },
};

export default function ChatContainer({ onBackToWorkspaceDetail }) {
  const { handlechatMessage, handleStopGeneration } = useChat();
  const { chats, currentChatId, isLoading, isGenerating } = useSelector(
    (state) => state.chat
  );
  const { activeWorkspaceId, workspaces } = useSelector(
    (state) => state.workspace
  );
  const { user } = useSelector(
    (state) => state.auth
  );
  const { agents, selectedAgentId, selectAgent, handleGetMarketplace } = useAgent();
  const { 
    handleUpload, 
    uploading, 
    uploadError, 
    uploadSuccess, 
    clearFeedback 
  } = useKnowledge();

  useEffect(() => {
    if (agents.length === 0) {
      handleGetMarketplace();
    }
  }, [agents, handleGetMarketplace]);

  const currentChat = chats[currentChatId];
  const messages = currentChat?.messages || [];
  const messagesContainerRef = useRef(null);

  const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId);

  // Deployed agents in this workspace (or all if personal workspace)
  const availableAgents = useMemo(() => {
    if (!activeWorkspaceId) {
      return agents;
    }
    if (!activeWorkspace) return [];
    // Convert deployed agents IDs to strings
    const deployedIds = (activeWorkspace.deployedAgents || []).map(id => id.toString());
    return agents.filter(a => a.isSystem || deployedIds.includes(a._id.toString()));
  }, [agents, activeWorkspace, activeWorkspaceId]);
  
  // Resolve current chat's workspace to a full object from the workspaces array
  let chatWorkspace = currentChat?.workspace;
  if (chatWorkspace) {
    const wsId = typeof chatWorkspace === "string" ? chatWorkspace : chatWorkspace._id;
    chatWorkspace = workspaces.find((w) => w._id === wsId);
  }
  
  const displayWorkspace = chatWorkspace || activeWorkspace;

  const isViewer = useMemo(() => {
    if (!displayWorkspace) return false;
    const userId = user?._id || user?.id;
    const ownerId = displayWorkspace.owner?._id || displayWorkspace.owner;
    if (ownerId && userId && ownerId.toString() === userId.toString()) {
      return false;
    }
    const memberRecord = displayWorkspace.members?.find(m => {
      const mId = m.user?._id || m.user;
      return mId && userId && mId.toString() === userId.toString();
    });
    return memberRecord?.role === "viewer";
  }, [displayWorkspace, user]);

  // Show typing dots only when loading but no AI message has started yet
  const lastMsg = messages[messages.length - 1];
  const showLoadingDots = isLoading && (!lastMsg || lastMsg.role === "user");

  const prevChatIdRef = useRef(currentChatId);

  // Auto Scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      // If we just switched chats, scroll instantly to the bottom
      if (prevChatIdRef.current !== currentChatId) {
        prevChatIdRef.current = currentChatId;
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "auto",
        });
        return;
      }

      // If AI is currently streaming response chunks, scroll instantly to avoid smooth-scroll paint thrashing/fluctuation
      const isStreaming = lastMsg?.role === "ai";
      
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: isStreaming ? "auto" : "smooth",
      });
    }
  }, [messages, isLoading, currentChatId, lastMsg]);

  const handleMessage = async ({ message }) => {
    await handlechatMessage({
      message,
      chatId: currentChatId,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f0e15] relative overflow-hidden min-h-0">

      {/* Workspace Chat Header */}
      {displayWorkspace && (
        <div className="shrink-0 h-14 px-6 flex items-center gap-4 bg-[#14121e] border-b border-[#252233] animate-in slide-in-from-top-1 duration-200">
          <button 
            onClick={() => onBackToWorkspaceDetail && onBackToWorkspaceDetail(displayWorkspace._id || displayWorkspace)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-[#a1a1aa] hover:text-white transition-all cursor-pointer flex items-center justify-center"
            title={`Back to ${displayWorkspace.name || "Workspace"}`}
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <span 
              className="px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1.5"
              style={{ 
                backgroundColor: (displayWorkspace.color || "#9d89ff") + "15",
                color: displayWorkspace.color || "#9d89ff",
                border: `1px solid ${(displayWorkspace.color || "#9d89ff")}30`
              }}
            >
              <span>{displayWorkspace.icon || "💼"}</span>
              <span>{displayWorkspace.name || "Workspace"}</span>
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#252233]"></div>

          <span className="text-sm font-semibold text-[#e4e4e7] truncate max-w-[300px]">
            {currentChat?.title || "New Chat"}
          </span>
          {currentChat?.agent && (
            <span 
              className="px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1.5 ml-2"
              style={{
                backgroundColor: `${currentChat.agent.color || "#3b82f6"}20`,
                color: currentChat.agent.color || "#3b82f6",
                border: `1px solid ${currentChat.agent.color || "#3b82f6"}40`
              }}
            >
              <span>{currentChat.agent.icon || "🤖"}</span>
              <span>{currentChat.agent.name}</span>
            </span>
          )}
        </div>
      )}

      {/* CHAT MODE */}
      {messages.length > 0 ? (
        <>
          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-10">
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
                      <div 
                        className="w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 shadow-lg"
                        style={{
                          backgroundColor: currentChat?.agent?.color ? `${currentChat.agent.color}20` : "#1d1b28",
                          borderColor: currentChat?.agent?.color ? `${currentChat.agent.color}40` : "#2a2638"
                        }}
                      >
                        <span className="text-sm">
                          {currentChat?.agent?.icon || "✨"}
                        </span>
                      </div>
                      {/* Message */}
                      <div className="bg-[#17151f] border border-[#252233] rounded-2xl px-5 py-4 max-w-[850px] shadow-[0_0_30px_rgba(0,0,0,0.25)]">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents}
                        >
                          {msg.content}
                        </ReactMarkdown>
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

              {/* Typing Animation Loader */}
              {showLoadingDots && (
                <div className="flex justify-start">
                  <div className="flex gap-4 max-w-full">
                    {/* Avatar */}
                    <div 
                      className="w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{
                        backgroundColor: currentChat?.agent?.color ? `${currentChat.agent.color}20` : "#1d1b28",
                        borderColor: currentChat?.agent?.color ? `${currentChat.agent.color}40` : "#2a2638"
                      }}
                    >
                      <span className="text-sm">
                        {currentChat?.agent?.icon || "✨"}
                      </span>
                    </div>
                    {/* Dots */}
                    <div className="bg-[#17151f] border border-[#252233] rounded-2xl px-5 py-4 max-w-[850px] shadow-[0_0_30px_rgba(0,0,0,0.25)] flex items-center gap-1.5 h-11">
                      <div className="w-2 h-2 bg-[#9d89ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#d4adff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#ffb1d9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
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
        <ChatInputBar 
          onsend={handleMessage} 
          disabled={isViewer} 
          isGenerating={isGenerating}
          onStop={() => handleStopGeneration(currentChatId || "temp-chat")}
          availableAgents={availableAgents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={selectAgent}
          showAgentSelector={messages.length === 0}
          onUploadFile={handleUpload}
          uploading={uploading}
          uploadError={uploadError}
          uploadSuccess={uploadSuccess}
          onClearFeedback={clearFeedback}
        />
      </div>

    </div>
  );
}