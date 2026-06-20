import { useState } from "react";
import { X, Loader2 } from "lucide-react";

const EMOJIS = ["🤖", "📊", "💻", "✍️", "🧠", "🎨", "🔍", "🚀"];
const COLORS = [
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#10b981", name: "Green" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#ef4444", name: "Red" },
  { hex: "#8b5cf6", name: "Purple" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#6366f1", name: "Indigo" },
];

export default function CreateAgentModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🤖");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [tools, setTools] = useState({
    web_search: true,
    knowledge_base: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Agent name is required");
    if (!systemPrompt.trim()) return setError("System prompt is required");

    setError("");
    setSubmitting(true);

    const enabledTools = Object.keys(tools).filter((key) => tools[key]);

    const success = await onCreate({
      name,
      description,
      systemPrompt,
      icon: selectedEmoji,
      color: selectedColor,
      tools: enabledTools,
    });

    setSubmitting(false);
    if (success) {
      onClose();
    } else {
      setError("Failed to create agent. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#15131c] border border-[#252233] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252233]">
          <h2 className="text-lg font-semibold text-[#f3f3f3]">Create Custom Agent</h2>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-[#e4e4e7] p-1.5 rounded-lg hover:bg-[#252233] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Name & Icon/Color selection */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-1.5">
                Agent Name
              </label>
              <input
                type="text"
                placeholder="e.g. Research Specialist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0f0e15] border border-[#252233] text-[#e4e4e7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9d89ff]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-1.5 text-center">
                Icon
              </label>
              <div className="flex justify-center items-center h-10 w-full bg-[#0f0e15] border border-[#252233] rounded-xl text-xl">
                {selectedEmoji}
              </div>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-1.5">
              Select Emoji
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-[#0f0e15] rounded-xl border border-[#252233]">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-xl p-2 rounded-lg hover:bg-[#252233] transition-all ${
                    selectedEmoji === emoji ? "bg-[#9d89ff]/20 scale-110" : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-1.5">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-[#0f0e15] rounded-xl border border-[#252233]">
              {COLORS.map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setSelectedColor(col.hex)}
                  className="w-6 h-6 rounded-full relative flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: col.hex }}
                >
                  {selectedColor === col.hex && (
                    <span className="w-2.5 h-2.5 bg-white rounded-full shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-1.5">
              Short Description
            </label>
            <input
              type="text"
              placeholder="What does this agent specialize in?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0f0e15] border border-[#252233] text-[#e4e4e7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9d89ff]/50 transition-colors"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-1.5 flex justify-between">
              <span>System Prompt</span>
              <span className="text-[10px] text-[#71717a] normal-case font-normal">Sets the personality & constraints</span>
            </label>
            <textarea
              rows={4}
              placeholder="e.g. You are a code reviewer. Your job is to read user code, find logic errors, suggest improvements..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-[#0f0e15] border border-[#252233] text-[#e4e4e7] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9d89ff]/50 transition-colors resize-none"
            />
          </div>

          {/* Enabled Tools */}
          <div>
            <label className="block text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-2">
              Capabilities (Tools)
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-[#0f0e15] border border-[#252233] rounded-xl cursor-pointer hover:border-[#9d89ff]/20 transition-colors">
                <input
                  type="checkbox"
                  checked={tools.web_search}
                  onChange={(e) => setTools({ ...tools, web_search: e.target.checked })}
                  className="rounded border-[#252233] text-[#9d89ff] focus:ring-0 focus:ring-offset-0 bg-[#0f0e15] w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-[#e4e4e7]">🌐 Web Search</p>
                  <p className="text-[11px] text-[#71717a]">Allows agent to lookup internet facts & current events</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#0f0e15] border border-[#252233] rounded-xl cursor-pointer hover:border-[#9d89ff]/20 transition-colors">
                <input
                  type="checkbox"
                  checked={tools.knowledge_base}
                  onChange={(e) => setTools({ ...tools, knowledge_base: e.target.checked })}
                  className="rounded border-[#252233] text-[#9d89ff] focus:ring-0 focus:ring-offset-0 bg-[#0f0e15] w-4 h-4"
                />
                <div>
                  <p className="text-sm font-medium text-[#e4e4e7]">📚 Knowledge Base</p>
                  <p className="text-[11px] text-[#71717a]">Scans user uploaded RAG documents within the workspace</p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-[#252233] mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-[#a1a1aa] bg-transparent border border-[#252233] rounded-xl hover:bg-[#252233]/40 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-[#9d89ff] hover:bg-[#866eff] rounded-xl shadow-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
