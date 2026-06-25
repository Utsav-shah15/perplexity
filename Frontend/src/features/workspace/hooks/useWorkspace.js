import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setWorkspaces,
  setActiveWorkspaceId,
  addWorkspace,
  removeWorkspace,
  updateWorkspaceInState,
  setWorkspaceLoading,
  setWorkspaceError,
} from "../workspace.slice";
import * as api from "../services/workspace.api";

export const useWorkspace = () => {
  const dispatch = useDispatch();
  const { workspaces, activeWorkspaceId, isLoading } = useSelector(
    (state) => state.workspace
  );

  const handleGetWorkspaces = useCallback(async () => {
    try {
      dispatch(setWorkspaceLoading(true));
      const data = await api.getWorkspaces();
      dispatch(setWorkspaces(data.workspaces));
    } catch {
      dispatch(setWorkspaceError(true));
    } finally {
      dispatch(setWorkspaceLoading(false));
    }
  }, [dispatch]);

  const handleCreateWorkspace = useCallback(
    async ({ name, description, color, icon }) => {
      try {
        dispatch(setWorkspaceLoading(true));
        const data = await api.createWorkspace({ name, description, color, icon });
        dispatch(addWorkspace(data.workspace));
        dispatch(setActiveWorkspaceId(data.workspace._id));
        return data.workspace;
      } catch {
        dispatch(setWorkspaceError(true));
        return null;
      } finally {
        dispatch(setWorkspaceLoading(false));
      }
    },
    [dispatch]
  );

  const handleDeleteWorkspace = useCallback(
    async (workspaceId) => {
      try {
        await api.deleteWorkspace(workspaceId);
        dispatch(removeWorkspace(workspaceId));
      } catch {
        dispatch(setWorkspaceError(true));
      }
    },
    [dispatch]
  );

  const handleUpdateWorkspace = useCallback(
    async (workspaceId, data) => {
      try {
        const result = await api.updateWorkspace(workspaceId, data);
        dispatch(updateWorkspaceInState(result.workspace));
        return result.workspace;
      } catch {
        dispatch(setWorkspaceError(true));
        return null;
      }
    },
    [dispatch]
  );

  const handleInviteMember = useCallback(
    async (workspaceId, { email, role }) => {
      try {
        const result = await api.inviteMember(workspaceId, { email, role });
        dispatch(updateWorkspaceInState(result.workspace));
        return true;
      } catch {
        dispatch(setWorkspaceError(true));
        return false;
      }
    },
    [dispatch]
  );

  const handleRemoveMember = useCallback(
    async (workspaceId, userId) => {
      try {
        const result = await api.removeMember(workspaceId, userId);
        dispatch(updateWorkspaceInState(result.workspace));
        return true;
      } catch {
        dispatch(setWorkspaceError(true));
        return false;
      }
    },
    [dispatch]
  );

  const handleUpdateMemberRole = useCallback(
    async (workspaceId, userId, role) => {
      try {
        const result = await api.updateMemberRole(workspaceId, userId, role);
        dispatch(updateWorkspaceInState(result.workspace));
        return true;
      } catch {
        dispatch(setWorkspaceError(true));
        return false;
      }
    },
    [dispatch]
  );

  const selectWorkspace = useCallback(
    (workspaceId) => {
      dispatch(setActiveWorkspaceId(workspaceId));
    },
    [dispatch]
  );

  return {
    workspaces,
    activeWorkspaceId,
    isLoading,
    handleGetWorkspaces,
    handleCreateWorkspace,
    handleDeleteWorkspace,
    handleUpdateWorkspace,
    handleInviteMember,
    handleRemoveMember,
    handleUpdateMemberRole,
    selectWorkspace,
  };
};
