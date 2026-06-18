import { createSlice } from "@reduxjs/toolkit";

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspaces: [],
    activeWorkspaceId: null,
    isLoading: false,
    isError: false,
  },
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
    },
    setActiveWorkspaceId: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);
    },
    updateWorkspaceInState: (state, action) => {
      const idx = state.workspaces.findIndex((w) => w._id === action.payload._id);
      if (idx !== -1) {
        state.workspaces[idx] = action.payload;
      }
    },
    removeWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter((w) => w._id !== action.payload);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = null;
      }
    },
    setWorkspaceLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setWorkspaceError: (state, action) => {
      state.isError = action.payload;
    },
  },
});

export const {
  setWorkspaces,
  setActiveWorkspaceId,
  addWorkspace,
  updateWorkspaceInState,
  removeWorkspace,
  setWorkspaceLoading,
  setWorkspaceError,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
