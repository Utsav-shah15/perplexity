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
         state.chats[chatId].messages=messages;
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
     }
  }
});
export const { setIsError, setLoading, setCurrentChatId, setChats, createNewChat, addNewMessage,setMessages } = chatSlice.actions;
export default chatSlice.reducer;