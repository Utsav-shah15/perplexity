import { useEffect, useState, useRef } from "react";
import {
  Search,
  FileText,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  FilePlus,
  MessageSquare,
  Settings2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { useWorkspace } from "../hooks/useWorkspace";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../../chat/hooks/useChat";
import { setCurrentChatId } from "../../chat/chat.slice";
import { useKnowledge } from "../../knowledge/hooks/useKnowledge";
import * as workspaceApi from "../services/workspace.api";

// Helpers
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const STATUS_STYLES = {
  ready: "text-emerald-400 bg-emerald-400/10",
  processing: "text-amber-400 bg-amber-400/10",
  failed: "text-red-400 bg-red-400/10",
};

export default function WorkspaceDetailPage({ workspace, onBack, onOpenChat }) {
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chat);
  const { handleGetChats, handlechatMessage } = useChat();
  const { handleUpdateWorkspace } = useWorkspace();
  const {
    documents,
    loading: docsLoading,
    uploading,
    uploadSuccess,
    uploadError,
    handleUpload,
    handleDelete: handleDeleteDoc,
  } = useKnowledge();

  const [instructions, setInstructions] = useState(workspace.customInstructions || "");
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [sessionFilter, setSessionFilter] = useState("all");
  const [messageInput, setMessageInput] = useState("");
  const fileInputRef = useRef(null);

  // Load workspace-specific chats — pass workspace ID directly
  useEffect(() => {
    handleGetChats(workspace._id);
  }, [workspace._id]);

  const workspaceChats = Object.values(chats)
    .filter(() => true) // chats already filtered by activeWorkspaceId in useChat
    .sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));

  // Save instructions
  const saveInstructions = async () => {
    await handleUpdateWorkspace(workspace._id, { customInstructions: instructions });
    setEditingInstructions(false);
  };

  // Start a new session (chat) in this workspace
  const handleStartSession = async () => {
    if (!messageInput.trim()) return;
    dispatch(setCurrentChatId(null));
    await handlechatMessage({ message: messageInput, chatId: null });
    setMessageInput("");
    onOpenChat();
  };

  // Open existing session
  const handleOpenSession = (chatId) => {
    dispatch(setCurrentChatId(chatId));
    onOpenChat();
  };

  // File upload
  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }

  return (
    <div className="flex-1 flex bg-[#0f0e15] overflow-hidden min-h-0">

      {/* ═══ LEFT: Sessions Area ═══ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-[#1e1d26]">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-[#71717a] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft size={18} />
            </button>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: workspace.color + "20" }}
            >
              {workspace.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#f3f3f3]">{workspace.name}</h1>
              <p className="text-[#71717a] text-sm">
                {workspace.description || "Describe your project, goals, subject, etc..."}
              </p>
            </div>
          </div>

          {/* Sessions Tab */}
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-white border-b-2 border-[#9d89ff] pb-2">
              Sessions
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-8 pt-4 pb-2 flex items-center gap-4">
          <button
            onClick={() => setSessionFilter("all")}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              sessionFilter === "all"
                ? "text-white bg-white/10"
                : "text-[#71717a] hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSessionFilter("yours")}
            className={`text-sm px-3 py-1 rounded-lg transition-colors ${
              sessionFilter === "yours"
                ? "text-white bg-white/10"
                : "text-[#71717a] hover:text-white"
            }`}
          >
            Your sessions
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-8 py-2">
          {workspaceChats.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={36} className="text-[#3d3a50] mx-auto mb-3" />
              <p className="text-[#71717a] text-sm">No sessions yet</p>
              <p className="text-[#3d3a50] text-xs mt-1">Start a conversation below</p>
            </div>
          ) : (
            <div className="space-y-1">
              {workspaceChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleOpenSession(chat.id)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.04] cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Search size={14} className="text-[#71717a] flex-shrink-0" />
                    <span className="text-[#e4e4e7] text-sm truncate">
                      {chat.title}
                    </span>
                  </div>
                  <span className="text-[#3d3a50] text-xs flex-shrink-0 ml-4">
                    {timeAgo(chat.lastUpdated)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="px-8 pb-6 pt-3">
          <div className="bg-[#1c1b22] border border-[#2a2638] rounded-2xl px-5 py-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartSession()}
              placeholder={`Start a session in ${workspace.name.toLowerCase()}`}
              className="w-full bg-transparent text-[#e4e4e7] text-sm placeholder-[#3d3a50] outline-none"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#252233]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#71717a] px-2 py-0.5 rounded bg-white/5">
                  🔍 Search
                </span>
                <span className="text-[11px] text-[#71717a] px-2 py-0.5 rounded bg-white/5">
                  📚 Knowledge Base
                </span>
              </div>
              <button
                onClick={handleStartSession}
                disabled={!messageInput.trim()}
                className="w-8 h-8 rounded-full bg-[#9d89ff] hover:bg-[#8b75ff] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Settings Sidebar ═══ */}
      <div className="w-[300px] border-l border-[#1e1d26] bg-[#0f0e15] overflow-y-auto flex-shrink-0">
        <div className="p-5 space-y-6">

          {/* Instructions */}
          <div>
            <h3 className="text-sm font-semibold text-[#f3f3f3] mb-1">Instructions</h3>
            <p className="text-[11px] text-[#71717a] mb-3">
              Tell the AI how it should work in this space.
            </p>
            {editingInstructions ? (
              <div className="space-y-2">
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  className="w-full bg-[#15131c] border border-[#252233] rounded-xl px-3 py-2 text-sm text-[#e4e4e7] placeholder-[#3d3a50] outline-none focus:border-[#9d89ff]/50 resize-none"
                  placeholder="e.g. Always respond in Hindi, focus on technical details..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingInstructions(false)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-[#252233] text-[#71717a] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveInstructions}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-[#9d89ff] text-white hover:bg-[#8b75ff] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingInstructions(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#252233] text-[#71717a] hover:text-[#9d89ff] hover:border-[#9d89ff]/30 transition-colors text-sm"
              >
                <Plus size={14} />
                {instructions ? "Edit instructions..." : "Add instructions..."}
              </button>
            )}
            {instructions && !editingInstructions && (
              <p className="text-xs text-[#71717a] mt-2 bg-[#15131c] rounded-lg px-3 py-2 border border-[#252233]">
                {instructions.length > 100 ? instructions.slice(0, 100) + "..." : instructions}
              </p>
            )}
          </div>

          {/* Files */}
          <div>
            <h3 className="text-sm font-semibold text-[#f3f3f3] mb-1">Files</h3>
            <p className="text-[11px] text-[#71717a] mb-3">
              Add reference docs, data, or files for context.
            </p>

            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.csv"
              onChange={onFileChange}
              className="hidden"
            />
            <button
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-dashed border-[#252233] text-[#71717a] hover:text-[#9d89ff] hover:border-[#9d89ff]/30 transition-colors text-sm disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                {uploading ? "Uploading..." : "Add files..."}
              </span>
              <Trash2 size={14} className="opacity-0" /> {/* Spacer */}
            </button>

            {/* Upload Feedback */}
            {uploadSuccess && (
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle size={12} /> {uploadSuccess}
              </p>
            )}
            {uploadError && (
              <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {uploadError}
              </p>
            )}

            {/* File List */}
            {docsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="text-[#9d89ff] animate-spin" />
              </div>
            ) : (
              <div className="mt-3 space-y-1.5">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#15131c] border border-[#252233] group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-[#9d89ff] flex-shrink-0" />
                      <span className="text-xs text-[#e4e4e7] truncate max-w-[160px]">
                        {doc.originalName}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="text-[#71717a] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links (placeholder) */}
          <div>
            <h3 className="text-sm font-semibold text-[#f3f3f3] mb-1">Links</h3>
            <p className="text-[11px] text-[#71717a] mb-3">
              Add websites the AI should prioritize when searching.
            </p>
            <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-[#252233] text-[#71717a] hover:text-[#9d89ff] hover:border-[#9d89ff]/30 transition-colors text-sm">
              <Plus size={14} />
              Add link...
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
