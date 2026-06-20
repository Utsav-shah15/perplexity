import { createSlice } from "@reduxjs/toolkit";

const agentSlice = createSlice({
  name: "agent",
  initialState: {
    agents: [],
    selectedAgentId: null, // null means "Default Assistant"
    isLoading: false,
    isError: false,
  },
  reducers: {
    setAgents: (state, action) => {
      state.agents = action.payload;
    },
    setSelectedAgentId: (state, action) => {
      state.selectedAgentId = action.payload;
    },
    addAgent: (state, action) => {
      state.agents.push(action.payload);
    },
    setAgentLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAgentError: (state, action) => {
      state.isError = action.payload;
    },
  },
});

export const {
  setAgents,
  setSelectedAgentId,
  addAgent,
  setAgentLoading,
  setAgentError,
} = agentSlice.actions;

export default agentSlice.reducer;
