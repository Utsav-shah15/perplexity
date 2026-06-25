import {
  Lightbulb,
  PenTool,
  Bug,
  Compass,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Cpu,
  Layers,
  Bot,
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

// ─── Streaming Message Renderer with Smooth Throttled Typewriter ──────────────────
function StreamingMessageRenderer({ content, isGenerating, isLastMessage }) {
  const [displayedText, setDisplayedText] = useState(content);
  const queueRef = useRef(content);
  const timerRef = useRef(null);

  const shouldAnimate = isLastMessage && isGenerating;

  // Handle active streaming
  useEffect(() => {
    if (!shouldAnimate) return;

    queueRef.current = content;

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setDisplayedText((prev) => {
          const target = queueRef.current;
          if (prev.length < target.length) {
            // Smooth speed regulation: step depends on how far behind we are
            const diff = target.length - prev.length;
            const step = diff > 40 ? 6 : diff > 15 ? 3 : 1;
            return prev + target.slice(prev.length, prev.length + step);
          } else {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return prev;
          }
        });
      }, 20); // 20ms intervals for a highly readable and fluid typing rhythm
    }
  }, [content, shouldAnimate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Sync initial content or immediate updates if not animating
  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(content);
    } else if (content && !displayedText) {
      setDisplayedText(content.slice(0, 1));
    }
  }, [content, shouldAnimate, displayedText]);

  // Use displayedText if animating, otherwise raw content
  const textToRender = shouldAnimate ? displayedText : content;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
    >
      {textToRender}
    </ReactMarkdown>
  );
}

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

  const handleMessage = async ({ message, imageBase64, imageMimeType, images }) => {
    await handlechatMessage({
      message,
      chatId: currentChatId,
      imageBase64,
      imageMimeType,
      images,
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
                        <StreamingMessageRenderer
                          content={msg.content}
                          isGenerating={isGenerating}
                          isLastMessage={index === messages.length - 1}
                        />
                      </div>
                    </div>
                  )}

                  {/* USER MESSAGE */}
                  {msg.role === "user" && (
                    <div className="flex flex-col items-end gap-2 max-w-[700px]">
                      {msg.imageBase64 && (!msg.images || msg.images.length === 0) && (
                        <img
                          src={`data:${msg.imageMimeType || "image/jpeg"};base64,${msg.imageBase64}`}
                          alt="attached"
                          className="max-w-[320px] max-h-[240px] rounded-2xl object-contain border border-[#a593ff33] shadow-lg"
                        />
                      )}
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-end max-w-[600px]">
                          {msg.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`data:${img.mimeType || "image/jpeg"};base64,${img.base64}`}
                              alt={`attached-${idx}`}
                              className="max-w-[200px] max-h-[150px] rounded-2xl object-contain border border-[#a593ff33] shadow-lg"
                            />
                          ))}
                        </div>
                      )}
                      {msg.content && (
                        <div className="bg-gradient-to-br from-[#9d89ff] to-[#7c67ff] text-white px-5 py-4 rounded-2xl text-[15px] leading-7 shadow-[0_0_25px_rgba(157,137,255,0.25)] border border-[#a593ff33]">
                          <p className="whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      )}
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

          {/* INPUT (Bottom) */}
          <div className="px-4 max-w-4xl mx-auto w-full pb-6 pt-2">
            <ChatInputBar 
              onsend={handleMessage} 
              disabled={isViewer} 
              isGenerating={isGenerating}
              onStop={() => handleStopGeneration(currentChatId || "temp-chat")}
              availableAgents={availableAgents}
              selectedAgentId={selectedAgentId}
              onSelectAgent={selectAgent}
              showAgentSelector={false}
              onUploadFile={handleUpload}
              uploading={uploading}
              uploadError={uploadError}
              uploadSuccess={uploadSuccess}
              onClearFeedback={clearFeedback}
            />
          </div>
        </>

      ) : (

        /* EMPTY STATE */
        <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto relative min-h-0 select-none">
          
          {/* Floating Glow Blobs */}
          <div className="absolute top-[20%] left-[30%] w-[200px] h-[200px] rounded-full bg-[#9d89ff]/5 blur-[70px] pointer-events-none"></div>
          <div className="absolute bottom-[30%] right-[30%] w-[220px] h-[220px] rounded-full bg-[#ffb1d9]/4 blur-[85px] pointer-events-none"></div>

          {/* Center Content Container */}
          <div className="w-full max-w-3xl flex flex-col items-center gap-6 mt-[-4vh] z-10 px-4">
            {/* Hero Section */}
            <div className="text-center">
              <h1 className="text-[38px] md:text-[46px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#9d89ff] via-[#d4adff] to-[#ffb1d9] tracking-tight drop-shadow-[0_0_20px_rgba(157,137,255,0.1)] font-sans">
                Aura AI
              </h1>
              <p className="text-[#8e8e9c] text-sm md:text-[15px] font-medium mt-1">
                What can I help you with today?
              </p>
            </div>

            {/* Input Bar Centered */}
            <div className="w-full">
              <ChatInputBar 
                onsend={handleMessage} 
                disabled={isViewer} 
                isGenerating={isGenerating}
                onStop={() => handleStopGeneration(currentChatId || "temp-chat")}
                availableAgents={availableAgents}
                selectedAgentId={selectedAgentId}
                onSelectAgent={selectAgent}
                showAgentSelector={true}
                onUploadFile={handleUpload}
                uploading={uploading}
                uploadError={uploadError}
                uploadSuccess={uploadSuccess}
                onClearFeedback={clearFeedback}
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}