import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import chatReducer from "../features/chat/chat.slice";
import workspaceReducer from "../features/workspace/workspace.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    workspace: workspaceReducer,
  },
});