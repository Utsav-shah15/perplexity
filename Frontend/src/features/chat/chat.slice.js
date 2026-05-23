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
     setChats:(state,action)=>{
        state.chats = action.payload;
     },
     currentChatId:(state,action)=>{
        state.currentChatId = action.payload;
     },
     isLoading:(state,action)=>{
        state.isLoading = action.payload;
     },
     isError:(state,action)=>{
        state.isError = action.payload;
     }
  }
});

export const { isError, isLoading, currentChatId, setChats } = chatSlice.actions;
export default chatSlice.reducer;