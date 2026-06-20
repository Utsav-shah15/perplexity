import { ArrowUp, Paperclip, Mic, Zap, Globe, Square, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function ChatInputBar({ 
  onsend, 
  disabled, 
  isGenerating, 
  onStop,
  availableAgents = [],
  selectedAgentId = null,
  onSelectAgent = () => {},
  showAgentSelector = false,
  onUploadFile = () => {},
  uploading = false,
  uploadError = null,
  uploadSuccess = null,
  onClearFeedback = () => {}
}) {
  const [input, setInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleMessage = () => {
    if (disabled || uploading || input.trim() === "") return;
    onsend({ message: input });
    setInput("");
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadFile(file);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAgent = availableAgents.find(a => a._id === selectedAgentId);

  return (
    <div className={`bg-[#211d33] border border-[#342e4d] rounded-2xl p-2 shadow-2xl flex flex-col gap-2 ${disabled ? "opacity-50" : ""}`}>

      {/* Top action bar */}
      <div className="flex items-center gap-4 px-3 pt-1 text-[13px] text-[#a1a1aa] font-medium">
        <button disabled={disabled} className="flex items-center gap-1.5 hover:text-white transition-colors disabled:pointer-events-none">
          <Zap size={14} />
          <span>Aura-4 Turbo</span>
          <span className="text-[10px] ml-0.5 opacity-50">▼</span>
        </button>

        {/* Dynamic Agent Selector */}
        {showAgentSelector && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-[#342e4d] bg-[#191626] text-[#e4e4e7] hover:text-white transition-colors disabled:pointer-events-none cursor-pointer"
            >
              <span>{selectedAgent ? selectedAgent.icon : "✨"}</span>
              <span>{selectedAgent ? selectedAgent.name : "Default Assistant"}</span>
              <ChevronDown size={12} className="opacity-50" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 bottom-8 z-30 w-52 bg-[#14121a] border border-[#2c293c] rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <p className="text-[9px] font-bold text-[#71717a] uppercase tracking-wider px-2.5 py-1.5 border-b border-[#2c293c]/50 mb-1">
                  Choose Chat Mode
                </p>
                
                <button
                  type="button"
                  onClick={() => {
                    onSelectAgent(null);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-[#e4e4e7] hover:bg-[#201e2c] rounded-lg transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Default Assistant</span>
                  </span>
                  {selectedAgentId === null && <Check size={12} className="text-[#9d89ff]" />}
                </button>

                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {availableAgents.map((agent) => (
                    <button
                      key={agent._id}
                      type="button"
                      onClick={() => {
                        onSelectAgent(agent._id);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-[#e4e4e7] hover:bg-[#201e2c] rounded-lg transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{agent.icon || "🤖"}</span>
                        <span className="truncate">{agent.name}</span>
                      </span>
                      {selectedAgentId === agent._id && <Check size={12} className="text-[#9d89ff]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button disabled={disabled} className="flex items-center gap-1.5 hover:text-white transition-colors disabled:pointer-events-none">
          <Globe size={14} />
          <span>Search</span>
        </button>
      </div>

      {/* Uploading Status Banner */}
      {(uploading || uploadSuccess || uploadError) && (
        <div className="mx-2 px-3 py-2 rounded-xl flex items-center justify-between text-xs bg-[#191626] border border-[#2b2542] animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 truncate">
            {uploading && (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#9d89ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-[#a1a1aa] truncate">Uploading & indexing document...</span>
              </>
            )}
            {uploadSuccess && (
              <>
                <span className="text-[#10b981] flex-shrink-0 font-bold">✓</span>
                <span className="text-[#10b981] truncate">{uploadSuccess}</span>
              </>
            )}
            {uploadError && (
              <>
                <span className="text-red-400 flex-shrink-0">⚠️</span>
                <span className="text-red-400 truncate">{uploadError}</span>
              </>
            )}
          </div>
          {(uploadSuccess || uploadError) && (
            <button 
              type="button"
              onClick={onClearFeedback} 
              className="text-[#71717a] hover:text-white ml-2 text-sm font-bold cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Input area */}
      <div className="bg-[#191626] rounded-xl flex items-center px-2 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleMessage();
          }}
          disabled={disabled || uploading}
          placeholder={disabled ? "You have viewer-only access to this workspace." : uploading ? "Uploading & indexing..." : "Message Aura AI..."}
          className="flex-1 bg-transparent outline-none text-[#e4e4e7] text-[15px] placeholder-[#71717a] px-3 h-10 disabled:cursor-not-allowed"
        />

        <div className="flex items-center gap-2 pr-1">
          <button 
            type="button"
            disabled={disabled || uploading} 
            onClick={() => fileInputRef.current?.click()}
            className="text-[#a1a1aa] hover:text-white transition-colors p-1.5 rounded-lg disabled:pointer-events-none cursor-pointer flex items-center justify-center"
            title="Upload file to Knowledge Base"
          >
            <Paperclip size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: "none" }} 
            accept=".pdf,.txt,.csv,.png,.jpg,.jpeg,.webp,.gif"
          />
          <button disabled={disabled || uploading} className="text-[#a1a1aa] hover:text-white transition-colors p-1.5 rounded-lg disabled:pointer-events-none">
            <Mic size={18} />
          </button>
          {isGenerating ? (
            <button
              onClick={onStop}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ml-1 shadow-sm cursor-pointer"
              title="Stop generating"
            >
              <Square size={14} fill="currentColor" strokeWidth={0} />
            </button>
          ) : (
            <button
              onClick={handleMessage}
              disabled={disabled || uploading || input.trim() === ""}
              className="bg-[#e4dcfb] hover:bg-[#d6c9fa] disabled:bg-[#342e4d] disabled:text-[#71717a] text-[#6d28d9] w-9 h-9 rounded-xl flex items-center justify-center transition-colors ml-1 shadow-sm disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
