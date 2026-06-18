import { useRef, useState } from "react";
import {
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  FilePlus,
} from "lucide-react";
import { useKnowledge } from "../hooks/useKnowledge";

// Helpers
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  ready: "text-emerald-400 bg-emerald-400/10",
  processing: "text-amber-400 bg-amber-400/10",
  failed: "text-red-400 bg-red-400/10",
};

const STATUS_ICONS = {
  ready: <CheckCircle size={12} />,
  processing: <Loader2 size={12} className="animate-spin" />,
  failed: <AlertCircle size={12} />,
};

export default function KnowledgeBasePage() {
  const {
    documents,
    loading,
    uploading,
    uploadError,
    uploadSuccess,
    handleUpload,
    handleDelete,
  } = useKnowledge();

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  async function onDelete(docId, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const ok = await handleDelete(docId);
    if (!ok) alert("Failed to delete document");
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f0e15] overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#9d89ff]/15 flex items-center justify-center">
              <Database size={24} className="text-[#9d89ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f3f3f3]">Knowledge Base</h1>
              <p className="text-[#71717a] text-sm">
                {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-6 ${
              dragOver
                ? "border-[#9d89ff] bg-[#9d89ff]/10"
                : "border-[#2a2638] hover:border-[#9d89ff]/50 hover:bg-white/[0.02]"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.csv"
              onChange={onFileChange}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-[#9d89ff] animate-spin" />
                <p className="text-[#a1a1aa] text-sm">Uploading & processing...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#9d89ff]/10 flex items-center justify-center">
                  <FilePlus size={24} className="text-[#9d89ff]" />
                </div>
                <div>
                  <p className="text-[#e4e4e7] text-base font-medium">
                    Drop a file here or click to upload
                  </p>
                  <p className="text-[#71717a] text-sm mt-1">PDF, TXT, CSV — max 10 MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Feedback */}
          {uploadSuccess && (
            <div className="mb-4 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-2.5">
              <CheckCircle size={14} />
              {uploadSuccess}
            </div>
          )}
          {uploadError && (
            <div className="mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
              <AlertCircle size={14} />
              {uploadError}
            </div>
          )}

          {/* Document List */}
          <div>
            <h2 className="text-[11px] font-bold text-[#71717a] tracking-[0.1em] mb-4 uppercase">
              Your Documents
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="text-[#9d89ff] animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={40} className="text-[#3d3a50] mx-auto mb-4" />
                <p className="text-[#71717a] text-sm">No documents yet</p>
                <p className="text-[#3d3a50] text-xs mt-1">Upload a file to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between bg-[#15131c] border border-[#252233] rounded-xl px-5 py-4 group hover:border-[#9d89ff]/20 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#242131] flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-[#9d89ff]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[#e4e4e7] text-sm font-medium truncate max-w-[320px]">
                          {doc.originalName}
                        </p>
                        <p className="text-[#71717a] text-xs mt-0.5">
                          {formatBytes(doc.size)} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[doc.status]}`}>
                        {STATUS_ICONS[doc.status]}
                        {doc.status}
                      </span>
                      <button
                        onClick={() => onDelete(doc._id, doc.originalName)}
                        className="text-[#71717a] hover:text-red-400 transition-colors p-1.5 rounded opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
