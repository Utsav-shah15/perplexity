import { useEffect, useState, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Users,
  FolderOpen,
  Loader2,
  Check,
  UserPlus,
  Crown,
  Pencil,
  Eye,
} from "lucide-react";
import { useWorkspace } from "../hooks/useWorkspace";

const COLORS = [
  "#9d89ff", "#ff6b9d", "#fbbf24", "#34d399",
  "#60a5fa", "#f472b6", "#a78bfa", "#fb923c",
];

const ICONS = ["💼", "🚀", "📚", "🎯", "💡", "🔬", "🎨", "⚡"];

const ROLE_LABELS = {
  owner: { label: "Owner", icon: <Crown size={12} />, color: "text-amber-400" },
  editor: { label: "Editor", icon: <Pencil size={12} />, color: "text-blue-400" },
  viewer: { label: "Viewer", icon: <Eye size={12} />, color: "text-gray-400" },
};

export default function WorkspacePanel({ onClose }) {
  const {
    workspaces,
    activeWorkspaceId,
    isLoading,
    handleGetWorkspaces,
    handleCreateWorkspace,
    handleDeleteWorkspace,
    handleInviteMember,
    selectWorkspace,
  } = useWorkspace();

  const [view, setView] = useState("list"); // list | create | invite
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    handleGetWorkspaces();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const ws = await handleCreateWorkspace({
      name,
      description,
      color: selectedColor,
      icon: selectedIcon,
    });
    if (ws) {
      setName("");
      setDescription("");
      setView("list");
      setFeedback({ type: "success", text: `"${ws.name}" created!` });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    const ok = await handleInviteMember(inviteWorkspaceId, {
      email: inviteEmail,
      role: inviteRole,
    });
    if (ok) {
      setInviteEmail("");
      setView("list");
      setFeedback({ type: "success", text: "Member invited!" });
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({ type: "error", text: "Failed to invite — check email" });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = async (wsId, wsName) => {
    if (!confirm(`Delete workspace "${wsName}"? All chats will be lost.`)) return;
    await handleDeleteWorkspace(wsId);
    setFeedback({ type: "success", text: "Workspace deleted" });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1c1b22] border border-[#2a2638] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2638]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#9d89ff]/15 flex items-center justify-center">
              <FolderOpen size={16} className="text-[#9d89ff]" />
            </div>
            <div>
              <h2 className="text-[#f3f3f3] font-semibold text-[15px]">Workspaces</h2>
              <p className="text-[#71717a] text-[12px]">
                {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mx-6 mt-3 flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 ${
              feedback.type === "success"
                ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                : "text-red-400 bg-red-400/10 border border-red-400/20"
            }`}
          >
            {feedback.type === "success" ? <Check size={14} /> : <X size={14} />}
            {feedback.text}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <>
            {/* Create Button */}
            <div className="px-6 py-4">
              <button
                onClick={() => setView("create")}
                className="w-full flex items-center justify-center gap-2 bg-[#9d89ff]/10 hover:bg-[#9d89ff]/20 border border-[#9d89ff]/30 text-[#9d89ff] py-2.5 rounded-xl transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Create Workspace
              </button>
            </div>

            {/* Workspace List */}
            <div className="px-6 pb-5 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="text-[#9d89ff] animate-spin" />
                </div>
              ) : workspaces.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen size={32} className="text-[#3d3a50] mx-auto mb-3" />
                  <p className="text-[#71717a] text-sm">No workspaces yet</p>
                  <p className="text-[#3d3a50] text-xs mt-1">
                    Create one to organize your projects
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workspaces.map((ws) => (
                    <div
                      key={ws._id}
                      onClick={() => {
                        selectWorkspace(ws._id);
                        onClose();
                      }}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 group cursor-pointer transition-all ${
                        ws._id === activeWorkspaceId
                          ? "bg-[#9d89ff]/10 border border-[#9d89ff]/30"
                          : "bg-[#15131c] border border-[#252233] hover:border-[#9d89ff]/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                          style={{ backgroundColor: ws.color + "20" }}
                        >
                          {ws.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#e4e4e7] text-sm font-medium truncate max-w-[200px]">
                            {ws.name}
                          </p>
                          <p className="text-[#71717a] text-xs">
                            {ws.members?.length || 1} member{(ws.members?.length || 1) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Invite */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInviteWorkspaceId(ws._id);
                            setView("invite");
                          }}
                          className="text-[#71717a] hover:text-[#9d89ff] transition-colors p-1.5 rounded opacity-0 group-hover:opacity-100"
                          title="Invite Member"
                        >
                          <UserPlus size={14} />
                        </button>
                        {/* Delete */}
                        {ws.owner?._id === ws.members?.find((m) => m.role === "owner")?.user?._id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ws._id, ws.name);
                            }}
                            className="text-[#71717a] hover:text-red-400 transition-colors p-1.5 rounded opacity-0 group-hover:opacity-100"
                            title="Delete Workspace"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── CREATE VIEW ── */}
        {view === "create" && (
          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="text-[12px] text-[#71717a] font-medium mb-1.5 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Project"
                className="w-full bg-[#15131c] border border-[#252233] rounded-xl px-4 py-2.5 text-[#e4e4e7] text-sm placeholder-[#3d3a50] outline-none focus:border-[#9d89ff]/50 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[12px] text-[#71717a] font-medium mb-1.5 block">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description..."
                className="w-full bg-[#15131c] border border-[#252233] rounded-xl px-4 py-2.5 text-[#e4e4e7] text-sm placeholder-[#3d3a50] outline-none focus:border-[#9d89ff]/50 transition-colors"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="text-[12px] text-[#71717a] font-medium mb-1.5 block">Icon</label>
              <div className="flex gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                      selectedIcon === icon
                        ? "bg-[#9d89ff]/20 border-2 border-[#9d89ff]"
                        : "bg-[#15131c] border border-[#252233] hover:border-[#9d89ff]/30"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-[12px] text-[#71717a] font-medium mb-1.5 block">Color</label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#1c1b22]"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setView("list")}
                className="flex-1 py-2.5 rounded-xl border border-[#252233] text-[#a1a1aa] hover:text-white hover:border-[#3d3a50] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#9d89ff] hover:bg-[#8b75ff] text-white font-medium transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* ── INVITE VIEW ── */}
        {view === "invite" && (
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-[12px] text-[#71717a] font-medium mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full bg-[#15131c] border border-[#252233] rounded-xl px-4 py-2.5 text-[#e4e4e7] text-sm placeholder-[#3d3a50] outline-none focus:border-[#9d89ff]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-[12px] text-[#71717a] font-medium mb-1.5 block">Role</label>
              <div className="flex gap-2">
                {["viewer", "editor"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setInviteRole(role)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                      inviteRole === role
                        ? "bg-[#9d89ff]/15 border border-[#9d89ff]/40 text-[#9d89ff]"
                        : "bg-[#15131c] border border-[#252233] text-[#71717a] hover:text-white"
                    }`}
                  >
                    {ROLE_LABELS[role].icon}
                    {ROLE_LABELS[role].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setView("list")}
                className="flex-1 py-2.5 rounded-xl border border-[#252233] text-[#a1a1aa] hover:text-white hover:border-[#3d3a50] transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#9d89ff] hover:bg-[#8b75ff] text-white font-medium transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Invite
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
