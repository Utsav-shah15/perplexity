import { useDispatch } from "react-redux";
import { setCurrentChatId } from "../../chat.slice";
import { useChat } from "../../hooks/useChat";
import { Trash2 } from "lucide-react";

export default function SidebarItem({
  icon,
  label,
  active,
  chatId,
  onClick,   // optional: override default behavior
}) {

  const dispatch=useDispatch();
  const { handleGetMessages, handleDeleteChat } = useChat();

  const handleClick = async () => {
    // If chatId exists, select it and load messages
    if (chatId) {
      dispatch(setCurrentChatId(chatId));
      await handleGetMessages(chatId);
      // Also call custom onClick if provided (e.g. to switch view to "chat")
      if (onClick) onClick();
      return;
    }
    // For non-chat items, just call onClick
    if (onClick) {
      onClick();
      return;
    }
    if (label === "Home") {
      dispatch(setCurrentChatId(null));
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await handleDeleteChat(chatId);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm font-medium group cursor-pointer
      ${
        active
          ? "bg-[#2d2a3d] text-[#e8e8e8]"
          : "text-[#a1a1aa] hover:bg-[#2d2a3d]/50 hover:text-[#e8e8e8]"
      }`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center justify-center shrink-0">
          {icon}
        </div>
        <span className="truncate text-left">{label}</span>
      </div>

      {chatId && (
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-[#a1a1aa] hover:text-[#ef4444] shrink-0 ml-2"
          title="Delete Chat"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}