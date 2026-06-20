import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import { useWorkspace } from "../../workspace/hooks/useWorkspace";
import Sidebar from "../components/SideBar/SideBar";
import TopNavigationBar from "../components/TopBar/TopNavigation";
import ChatContainer from "../components/ChatArea/ChatContainer";
import KnowledgeBasePage from "../../knowledge/components/KnowledgeBasePage";
import WorkspacePage from "../../workspace/components/WorkspacePage";
import WorkspaceDetailPage from "../../workspace/components/WorkspaceDetailPage";
import AgentMarketplacePage from "../../agent/components/AgentMarketplacePage";
import {
  joinWorkspaceRoom,
  leaveWorkspaceRoom,
  joinChatRoom,
  leaveChatRoom,
} from "../services/chat.socket";

const DashBoard = () => {
  const { initializeSocketConnection, handleGetChats } = useChat();
  const { handleGetWorkspaces, selectWorkspace } = useWorkspace();
  const { workspaces, activeWorkspaceId } = useSelector((state) => state.workspace);
  const { currentChatId } = useSelector((state) => state.chat);

  // Controls which page shows in the main panel
  // "chat" | "knowledge" | "workspace" | "workspace-detail" | "agents"
  const [activeView, setActiveView] = useState("chat");

  useEffect(() => {
    initializeSocketConnection();
    handleGetChats("all");
    handleGetWorkspaces();
  }, []);

  // Join/leave rooms based on active workspace and chat
  useEffect(() => {
    if (activeWorkspaceId) {
      joinWorkspaceRoom(activeWorkspaceId);
    }
    if (currentChatId && currentChatId !== "temp-chat") {
      joinChatRoom(currentChatId);
    }

    return () => {
      if (activeWorkspaceId) {
        leaveWorkspaceRoom(activeWorkspaceId);
      }
      if (currentChatId && currentChatId !== "temp-chat") {
        leaveChatRoom(currentChatId);
      }
    };
  }, [activeWorkspaceId, currentChatId]);

  // Find active workspace for the detail page
  const activeWorkspace = workspaces.find((w) => w._id === activeWorkspaceId);

  // When a workspace is selected from workspace list, show its detail page
  const handleOpenWorkspaceDetail = (wsId) => {
    selectWorkspace(wsId);
    setActiveView("workspace-detail");
  };

  // Back from workspace detail to workspace list
  const handleBackToWorkspaceList = () => {
    selectWorkspace(null);
    setActiveView("workspace");
  };

  // Open chat from workspace detail
  const handleOpenChatFromWorkspace = () => {
    setActiveView("chat");
  };

  return (
    <div className="w-full h-screen flex bg-[#0f0e15] overflow-hidden font-sans">

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenWorkspaceDetail={handleOpenWorkspaceDetail}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col relative h-full min-h-0 overflow-hidden">

        {/* Top Navbar — hide in workspace detail for cleaner look */}
        {activeView !== "workspace-detail" && <TopNavigationBar />}

        {/* Main Content Area — switches based on activeView */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {activeView === "chat" && (
            <ChatContainer onBackToWorkspaceDetail={handleOpenWorkspaceDetail} />
          )}
          {activeView === "knowledge" && <KnowledgeBasePage />}
          {activeView === "agents" && <AgentMarketplacePage onNavigate={setActiveView} />}
          {activeView === "workspace" && (
            <WorkspacePage onOpenDetail={handleOpenWorkspaceDetail} />
          )}
          {activeView === "workspace-detail" && activeWorkspace && (
            <WorkspaceDetailPage
              workspace={activeWorkspace}
              onBack={handleBackToWorkspaceList}
              onOpenChat={handleOpenChatFromWorkspace}
            />
          )}
        </div>

        {/* Footer */}
        {activeView !== "workspace-detail" && (
          <div className="absolute bottom-0 w-full p-4 flex justify-between items-center text-[12px] font-medium text-[#71717a] bg-transparent pointer-events-none">
            <p className="pl-2">© 2026 Aura AI</p>
            <div className="flex gap-6 pr-4 pointer-events-auto">
              <button className="hover:text-[#a1a1aa] transition-colors">Privacy</button>
              <button className="hover:text-[#a1a1aa] transition-colors">Terms</button>
              <button className="hover:text-[#a1a1aa] transition-colors">API Status</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
