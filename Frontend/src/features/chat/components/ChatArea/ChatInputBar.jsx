import { ArrowUp, Mic, Square, ChevronDown, Check, X, Image, Plus } from "lucide-react";
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
  const [attachedImages, setAttachedImages] = useState([]); // Array of { base64, mimeType, previewUrl, name }
  const [attachedFiles, setAttachedFiles] = useState([]); // Array of { name, size, type, status: 'uploading' | 'success' | 'error' }
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Sync parent upload state to local files list
  useEffect(() => {
    if (!uploading) {
      if (uploadSuccess) {
        setAttachedFiles(prev => 
          prev.map(f => f.status === 'uploading' ? { ...f, status: 'success' } : f)
        );
      } else if (uploadError) {
        setAttachedFiles(prev => 
          prev.map(f => f.status === 'uploading' ? { ...f, status: 'error' } : f)
        );
      }
    }
  }, [uploading, uploadSuccess, uploadError]);

  const handleMessage = () => {
    if (disabled || (input.trim() === "" && attachedImages.length === 0 && attachedFiles.length === 0)) return;
    
    // We send images via visual model, files are already uploaded to KB
    const firstImg = attachedImages[0];
    onsend({ 
      message: input || (attachedImages.length > 0 ? "What is in these images?" : ""),
      imageBase64: firstImg?.base64 || null,
      imageMimeType: firstImg?.mimeType || null,
      images: attachedImages.map(img => ({ base64: img.base64, mimeType: img.mimeType }))
    });
    
    setInput("");
    setAttachedImages([]);
    setAttachedFiles([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop().toLowerCase(),
      status: 'uploading'
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);
    onUploadFile(files);
    
    if (e.target) e.target.value = "";
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        const [header, base64] = dataUrl.split(",");
        const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
        setAttachedImages(prev => [
          ...prev, 
          { base64, mimeType, previewUrl: dataUrl, name: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });
    
    if (e.target) e.target.value = "";
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
    <div className={`bg-[#171520] border border-[#2b2542] rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 focus-within:border-[#9d89ff]/50 transition-all ${disabled ? "opacity-60" : ""}`}>
      
      {/* Uploading/Success/Error Banners */}
      {(uploadSuccess || uploadError) && (
        <div className="px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs bg-[#1a1827] border border-[#2b2542] animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 truncate">
            {uploadSuccess && (
              <>
                <span className="text-[#10b981] font-bold">✓</span>
                <span className="text-[#10b981] truncate text-[11px]">{uploadSuccess}</span>
              </>
            )}
            {uploadError && (
              <>
                <span className="text-red-400">⚠️</span>
                <span className="text-red-400 truncate text-[11px]">{uploadError}</span>
              </>
            )}
          </div>
          <button 
            type="button"
            onClick={onClearFeedback} 
            className="text-[#71717a] hover:text-white font-bold cursor-pointer text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Attachment Previews Row */}
      {(attachedImages.length > 0 || attachedFiles.length > 0) && (
        <div className="flex flex-wrap gap-2.5 p-1 max-h-36 overflow-y-auto">
          {/* Images */}
          {attachedImages.map((img, idx) => (
            <div key={`img-${idx}`} className="relative group w-20 h-20 bg-[#14121a] rounded-xl border border-[#342e4d] overflow-hidden flex-shrink-0">
              <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setAttachedImages(prev => prev.filter((_, i) => i !== idx));
                }}
                className="absolute top-1 right-1 bg-black/65 hover:bg-black text-white hover:text-red-400 p-0.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center"
                title="Remove image"
              >
                <X size={10} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/55 text-[8px] text-center text-[#e4e4e7] truncate px-1 py-0.5">
                {img.name}
              </div>
            </div>
          ))}

          {/* Document Files */}
          {attachedFiles.map((file, idx) => {
            const isPdf = file.type === "pdf";
            const isCsv = file.type === "csv";
            const isTxt = file.type === "txt";
            let badgeBg = "bg-gray-500/20 text-gray-400 border border-gray-500/30";
            if (isPdf) badgeBg = "bg-red-500/20 text-red-400 border border-red-500/30";
            if (isCsv) badgeBg = "bg-green-500/20 text-green-400 border border-green-500/30";
            if (isTxt) badgeBg = "bg-blue-500/20 text-blue-400 border border-blue-500/30";

            return (
              <div key={`file-${idx}`} className="relative group w-28 h-20 bg-[#1f1b2c] rounded-xl border border-[#342e4d] p-2.5 flex flex-col justify-between flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded ${badgeBg}`}>
                    {file.type || "FILE"}
                  </span>
                  
                  {file.status === "uploading" ? (
                    <span className="w-2.5 h-2.5 border border-[#9d89ff] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white hover:text-red-400 p-0.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center"
                      title="Remove file"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
                <div className="text-left w-full mt-1.5">
                  <p className="text-[11px] text-[#e4e4e7] font-medium truncate w-full">
                    {file.name}
                  </p>
                  <p className="text-[9px] text-[#71717a] mt-0.5">
                    {file.status === "uploading" ? "Indexing..." : `${(file.size / 1024).toFixed(1)} KB`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input Text Area */}
      <div className="flex-1 flex min-h-[44px]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleMessage();
            }
          }}
          disabled={disabled || uploading}
          placeholder={
            disabled 
              ? "You have viewer-only access to this workspace." 
              : uploading 
                ? "Uploading & indexing..." 
                : attachedImages.length > 0 
                  ? "Ask something about these images..." 
                  : "Message Aura AI..."
          }
          rows={1}
          className="w-full bg-transparent outline-none border-none text-[#e4e4e7] text-[15px] placeholder-[#71717a] resize-none h-auto min-h-[36px] max-h-32 py-1.5 focus:ring-0 focus:outline-none"
        />
      </div>

      {/* Bottom Controls Row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#2b2542]/30 mt-1">
        
        {/* Left: Add files/images button */}
        <div className="flex items-center gap-1">
          {/* Document Upload Button */}
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[#a1a1aa] hover:text-white transition-colors p-2 rounded-xl bg-[#1e1a2b] hover:bg-[#272238] flex items-center justify-center cursor-pointer shadow-sm border border-[#2b2542]"
            title="Upload document to Knowledge Base"
          >
            <Plus size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: "none" }} 
            accept=".pdf,.txt,.csv"
            multiple
          />

          {/* Add Image Button */}
          <button 
            type="button"
            disabled={disabled}
            onClick={() => imageInputRef.current?.click()}
            className={`transition-colors p-2 rounded-xl bg-[#1e1a2b] hover:bg-[#272238] flex items-center justify-center cursor-pointer shadow-sm border border-[#2b2542] ${
              attachedImages.length > 0 ? "text-[#9d89ff] border-[#9d89ff]/30" : "text-[#a1a1aa] hover:text-white"
            }`}
            title="Attach image(s) for AI vision"
          >
            <Image size={15} />
          </button>
          <input 
            type="file" 
            ref={imageInputRef} 
            onChange={handleImageChange} 
            style={{ display: "none" }} 
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
          />
        </div>

        {/* Right: Model selection, Mic, Send */}
        <div className="flex items-center gap-2">
          
          {/* Agent/Model selector dropdown */}
          {showAgentSelector && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2b2542] bg-[#1e1a2b] hover:bg-[#272238] text-xs text-[#e4e4e7] hover:text-white transition-colors disabled:pointer-events-none cursor-pointer"
              >
                <span>{selectedAgent ? selectedAgent.icon : "✨"}</span>
                <span className="max-w-[80px] truncate">{selectedAgent ? selectedAgent.name : "Default"}</span>
                <ChevronDown size={10} className="opacity-50" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-30 w-52 bg-[#14121a] border border-[#2c293c] rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
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

          {/* Microphone */}
          <button 
            type="button" 
            disabled={disabled || uploading} 
            className="text-[#a1a1aa] hover:text-white transition-colors p-2 rounded-xl hover:bg-[#272238] flex items-center justify-center disabled:pointer-events-none"
          >
            <Mic size={15} />
          </button>

          {/* Send/Stop Button */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer border border-red-500/30"
              title="Stop generating"
            >
              <Square size={10} fill="currentColor" strokeWidth={0} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMessage}
              disabled={disabled || uploading || (input.trim() === "" && attachedImages.length === 0 && attachedFiles.length === 0)}
              className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#1e293b] disabled:text-[#475569] text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
