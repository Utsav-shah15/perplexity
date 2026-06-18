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

const DashBoard = () => {
  const { initializeSocketConnection, handleGetChats } = useChat();
  const { handleGetWorkspaces, selectWorkspace } = useWorkspace();
  const { workspaces, activeWorkspaceId } = useSelector((state) => state.workspace);

  // Controls which page shows in the main panel
  // "chat" | "knowledge" | "workspace" | "workspace-detail"
  const [activeView, setActiveView] = useState("chat");

  useEffect(() => {
    initializeSocketConnection();
    handleGetChats();
    handleGetWorkspaces();
  }, []);

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
    handleGetChats(null); // Reload personal chats
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
          {activeView === "chat" && <ChatContainer />}
          {activeView === "knowledge" && <KnowledgeBasePage />}
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
