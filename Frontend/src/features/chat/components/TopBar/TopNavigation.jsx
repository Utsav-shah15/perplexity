import { Star, Bell, Settings, LogOut, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "../../../auth/hook/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function TopNavigationBar() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = async () => {
    await handleLogout();
    navigate("/login");
  };

  // Avatar: initials from username
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "AU";

  return (
    <div className="h-14 px-6 flex items-center justify-between bg-[#0f0e15] border-b border-[#1f1d2b]">

      {/* Left Side: Title */}
      <div className="flex items-center gap-4 text-[15px] font-medium">
        <span className="text-[#f3f3f3] font-bold">Aura AI</span>
        <span className="text-[#71717a]">New Chat</span>
      </div>

      {/* Right Side: Icons + User */}
      <div className="flex items-center gap-5 text-[#a1a1aa]">

        <button className="hover:text-white transition-colors" title="Favorites">
          <Star size={18} />
        </button>

        <button className="hover:text-white transition-colors" title="Notifications">
          <Bell size={18} />
        </button>

        <button className="hover:text-white transition-colors" title="Settings">
          <Settings size={18} />
        </button>

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#9d89ff] to-[#7c67ff] flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </div>
            <ChevronDown
              size={14}
              className={`text-[#71717a] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-52 bg-[#1c1b22] border border-[#2a2638] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-[#2a2638]">
                <p className="text-[#e4e4e7] text-sm font-semibold truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-[#71717a] text-xs truncate mt-0.5">
                  {user?.email || ""}
                </p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#f87171] hover:bg-[#2a1f2e] transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}