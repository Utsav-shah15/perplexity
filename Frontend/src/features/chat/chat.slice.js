import {createSlice} from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats:{},
    currentChatId:null,
    isLoading:false,
    isError:false,
  },
  reducers: {
     createNewChat:(state,action)=>{
        const {chatId,title}=action.payload;
        state.chats[chatId]={
               id:chatId,
               title,
               messages:[],
               lastUpdated:Date.now() 
        }
        state.currentChatId=chatId;
    },
    addNewMessage:(state,action)=>{
       const {chatId,message}=action.payload;
       state.chats[chatId].messages.push(message);
       state.chats[chatId].lastUpdated=Date.now();
    },
     setMessages:(state,action)=>{
         const {chatId,messages}=action.payload;
         if (state.chats[chatId]) {
             state.chats[chatId].messages=messages;
         }
      },
     appendMessageChunk: (state, action) => {
        const { chatId, chunk } = action.payload;
        if (state.chats[chatId]) {
            const messages = state.chats[chatId].messages;
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === "ai") {
                if (lastMsg.content.startsWith("🔍 Searching")) {
                    lastMsg.content = chunk;
                } else {
                    lastMsg.content += chunk;
                }
            } else {
                messages.push({
                    role: "ai",
                    content: chunk,
                    createdAt: new Date().toISOString()
                });
            }
            state.chats[chatId].lastUpdated = Date.now();
        }
     },
     setToolStatus: (state, action) => {
        const { chatId, status } = action.payload;
        if (state.chats[chatId]) {
            const messages = state.chats[chatId].messages;
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === "ai") {
                lastMsg.content = status;
            } else {
                messages.push({
                    role: "ai",
                    content: status,
                    createdAt: new Date().toISOString()
                });
            }
            state.chats[chatId].lastUpdated = Date.now();
        }
     },
     setChats: (state, action) => {
        state.chats=action.payload; 
     },
     setCurrentChatId:(state,action)=>{
        state.currentChatId = action.payload;
     },
     setLoading:(state,action)=>{
        state.isLoading = action.payload;
     },
     setIsError:(state,action)=>{
        state.isError = action.payload;
     },
     deleteChatFromState:(state,action)=>{
        const chatId = action.payload;
        delete state.chats[chatId];
     }
  }
});
export const { setIsError, setLoading, setCurrentChatId, setChats, createNewChat, addNewMessage, setMessages, deleteChatFromState, appendMessageChunk, setToolStatus } = chatSlice.actions;
export default chatSlice.reducer;