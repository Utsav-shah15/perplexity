import { useDispatch } from "react-redux";
import { setCurrentChatId } from "../../chat.slice";
import { useChat } from "../../hooks/useChat";

export default function SidebarItem({
  icon,
  label,
  active,
  chatId
}) {

  const dispatch=useDispatch();
  const { handleGetMessages } = useChat();
  console.log(chatId);
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium
      ${
        active
          ? "bg-[#2d2a3d] text-[#e8e8e8]"
          : "text-[#a1a1aa] hover:bg-[#2d2a3d]/50 hover:text-[#e8e8e8]"
      }`}
      onClick={async () => {
        if(!chatId) return;
        dispatch(setCurrentChatId(chatId));
        await handleGetMessages(chatId);
       }}
    >
      <div className="flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </button>
  );
}