import { useEffect, useState } from "react";
import {
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
  X,
  ChevronLeft,
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

export default function WorkspacePage({ onOpenDetail }) {
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
    <div className="flex-1 flex flex-col bg-[#0f0e15] overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {view !== "list" && (
                <button
                  onClick={() => setView("list")}
                  className="text-[#71717a] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="w-12 h-12 rounded-2xl bg-[#9d89ff]/15 flex items-center justify-center">
                <FolderOpen size={24} className="text-[#9d89ff]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#f3f3f3]">
                  {view === "create" ? "New Workspace" : view === "invite" ? "Invite Member" : "Workspaces"}
                </h1>
                <p className="text-[#71717a] text-sm">
                  {view === "list" && `${workspaces.length} workspace${workspaces.length !== 1 ? "s" : ""}`}
                  {view === "create" && "Set up a new project workspace"}
                  {view === "invite" && "Add a teammate by email"}
                </p>
              </div>
            </div>

            {view === "list" && (
              <button
                onClick={() => setView("create")}
                className="flex items-center gap-2 bg-[#9d89ff] hover:bg-[#8b75ff] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                New Workspace
              </button>
            )}
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`mb-6 flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 ${
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
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="text-[#9d89ff] animate-spin" />
                </div>
              ) : workspaces.length === 0 ? (
                <div className="text-center py-16">
                  <FolderOpen size={48} className="text-[#3d3a50] mx-auto mb-4" />
                  <p className="text-[#71717a] text-base mb-1">No workspaces yet</p>
                  <p className="text-[#3d3a50] text-sm">Create one to organize your projects</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workspaces.map((ws) => (
                    <div
                      key={ws._id}
                      onClick={() => onOpenDetail ? onOpenDetail(ws._id) : selectWorkspace(ws._id)}
                      className={`flex items-center justify-between rounded-2xl px-5 py-4 group cursor-pointer transition-all ${
                        ws._id === activeWorkspaceId
                          ? "bg-[#9d89ff]/10 border-2 border-[#9d89ff]/40"
                          : "bg-[#15131c] border border-[#252233] hover:border-[#9d89ff]/20"
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                          style={{ backgroundColor: ws.color + "20" }}
                        >
                          {ws.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#e4e4e7] text-base font-semibold truncate max-w-[280px]">
                            {ws.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[#71717a] text-xs flex items-center gap-1">
                              <Users size={12} />
                              {ws.members?.length || 1} member{(ws.members?.length || 1) !== 1 ? "s" : ""}
                            </span>
                            {ws.description && (
                              <span className="text-[#3d3a50] text-xs truncate max-w-[200px]">
                                {ws.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ws._id === activeWorkspaceId && (
                          <span className="text-[10px] font-medium text-[#9d89ff] bg-[#9d89ff]/10 px-2.5 py-1 rounded-full">
                            Active
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInviteWorkspaceId(ws._id);
                            setView("invite");
                          }}
                          className="text-[#71717a] hover:text-[#9d89ff] transition-colors p-2 rounded-lg opacity-0 group-hover:opacity-100"
                          title="Invite Member"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ws._id, ws.name);
                          }}
                          className="text-[#71717a] hover:text-red-400 transition-colors p-2 rounded-lg opacity-0 group-hover:opacity-100"
                          title="Delete Workspace"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CREATE VIEW ── */}
          {view === "create" && (
            <div className="bg-[#15131c] border border-[#252233] rounded-2xl p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="text-[12px] text-[#71717a] font-medium mb-2 block">Workspace Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Project"
                  className="w-full bg-[#0f0e15] border border-[#252233] rounded-xl px-4 py-3 text-[#e4e4e7] text-sm placeholder-[#3d3a50] outline-none focus:border-[#9d89ff]/50 transition-colors"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[12px] text-[#71717a] font-medium mb-2 block">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description..."
                  className="w-full bg-[#0f0e15] border border-[#252233] rounded-xl px-4 py-3 text-[#e4e4e7] text-sm placeholder-[#3d3a50] outline-none focus:border-[#9d89ff]/50 transition-colors"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="text-[12px] text-[#71717a] font-medium mb-2 block">Icon</label>
                <div className="flex gap-2.5">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        selectedIcon === icon
                          ? "bg-[#9d89ff]/20 border-2 border-[#9d89ff]"
                          : "bg-[#0f0e15] border border-[#252233] hover:border-[#9d89ff]/30"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-[12px] text-[#71717a] font-medium mb-2 block">Color</label>
                <div className="flex gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#15131c]"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setView("list")}
                  className="flex-1 py-3 rounded-xl border border-[#252233] text-[#a1a1aa] hover:text-white hover:border-[#3d3a50] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#9d89ff] hover:bg-[#8b75ff] text-white font-medium transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create Workspace
                </button>
              </div>
            </div>
          )}

          {/* ── INVITE VIEW ── */}
          {view === "invite" && (
            <div className="bg-[#15131c] border border-[#252233] rounded-2xl p-6 space-y-5">
              <div>
                <label className="text-[12px] text-[#71717a] font-medium mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full bg-[#0f0e15] border border-[#252233] rounded-xl px-4 py-3 text-[#e4e4e7] text-sm placeholder-[#3d3a50] outline-none focus:border-[#9d89ff]/50 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[12px] text-[#71717a] font-medium mb-2 block">Role</label>
                <div className="flex gap-3">
                  {["viewer", "editor"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${
                        inviteRole === role
                          ? "bg-[#9d89ff]/15 border border-[#9d89ff]/40 text-[#9d89ff]"
                          : "bg-[#0f0e15] border border-[#252233] text-[#71717a] hover:text-white"
                      }`}
                    >
                      {ROLE_LABELS[role].icon}
                      {ROLE_LABELS[role].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setView("list")}
                  className="flex-1 py-3 rounded-xl border border-[#252233] text-[#a1a1aa] hover:text-white hover:border-[#3d3a50] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#9d89ff] hover:bg-[#8b75ff] text-white font-medium transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send Invite
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
