import {useSelector} from "react-redux";
import React from 'react'
import { useEffect } from "react";
import { useChat } from "../hooks/useChat";
import Sidebar from "../components/SideBar/SideBar";
import TopNavigationBar from "../components/TopBar/TopNavigation";
import ChatContainer from "../components/ChatArea/ChatContainer";

const DashBoard = () => {
  const chat=useChat();  
  const {user}=useSelector(state=>state.auth);  

  useEffect(()=>{
    chat.initializeSocketConnection();
    chat.handleGetChats();
  },[])
  
  return (
     <div className="w-full h-screen flex bg-[#0f0e15] overflow-hidden font-sans">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col relative h-full min-h-0 overflow-hidden">

        {/* Top Navbar */}
        <TopNavigationBar />

        {/* Chat / Home Area */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <ChatContainer />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 flex justify-between items-center text-[12px] font-medium text-[#71717a] bg-transparent pointer-events-none">
          <p className="pl-2">© 2026 Aura AI</p>
          <div className="flex gap-6 pr-4 pointer-events-auto">
            <button className="hover:text-[#a1a1aa] transition-colors">Privacy</button>
            <button className="hover:text-[#a1a1aa] transition-colors">Terms</button>
            <button className="hover:text-[#a1a1aa] transition-colors">API Status</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashBoard
