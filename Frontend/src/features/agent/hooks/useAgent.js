import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setAgents,
  setSelectedAgentId,
  addAgent,
  setAgentLoading,
  setAgentError,
} from "../agent.slice";
import { updateWorkspaceInState } from "../../workspace/workspace.slice";
import * as api from "../services/agent.api";

export const useAgent = () => {
  const dispatch = useDispatch();
  const { agents, selectedAgentId, isLoading, isError } = useSelector(
    (state) => state.agent
  );

  const handleGetMarketplace = useCallback(async () => {
    try {
      dispatch(setAgentLoading(true));
      const data = await api.getMarketplace();
      dispatch(setAgents(data.agents));
    } catch {
      dispatch(setAgentError(true));
    } finally {
      dispatch(setAgentLoading(false));
    }
  }, [dispatch]);

  const handleCreateAgent = useCallback(
    async (agentData) => {
      try {
        dispatch(setAgentLoading(true));
        const data = await api.createAgent(agentData);
        dispatch(addAgent(data.agent));
        return data.agent;
      } catch {
        dispatch(setAgentError(true));
        return null;
      } finally {
        dispatch(setAgentLoading(false));
      }
    },
    [dispatch]
  );

  const handleDeployAgent = useCallback(
    async (workspaceId, agentId) => {
      try {
        const data = await api.deployAgent(workspaceId, agentId);
        // Sync the workspace in Redux store
        dispatch(updateWorkspaceInState(data.workspace));
        return true;
      } catch {
        dispatch(setAgentError(true));
        return false;
      }
    },
    [dispatch]
  );

  const handleUndeployAgent = useCallback(
    async (workspaceId, agentId) => {
      try {
        const data = await api.undeployAgent(workspaceId, agentId);
        // Sync the workspace in Redux store
        dispatch(updateWorkspaceInState(data.workspace));
        return true;
      } catch {
        dispatch(setAgentError(true));
        return false;
      }
    },
    [dispatch]
  );

  const selectAgent = useCallback(
    (agentId) => {
      dispatch(setSelectedAgentId(agentId));
    },
    [dispatch]
  );

  return {
    agents,
    selectedAgentId,
    isLoading,
    isError,
    handleGetMarketplace,
    handleCreateAgent,
    handleDeployAgent,
    handleUndeployAgent,
    selectAgent,
  };
};
