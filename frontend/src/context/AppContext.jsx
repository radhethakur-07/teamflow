import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useSocket } from './SocketContext.jsx';
import workspaceService from '../services/workspaceService.js';
import teamService from '../services/teamService.js';
import projectService from '../services/projectService.js';
import taskService from '../services/taskService.js';
import notificationService from '../services/notificationService.js';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user, isAuthenticated, currentWorkspace, workspaces, switchWorkspace: authSwitchWorkspace } = useAuth();
  const toast = useToast();
  const { onTaskEvent, onNotification } = useSocket();

  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Subscribe to real-time socket events for live task updates and notifications
  useEffect(() => {
    const unsubTask = onTaskEvent((eventType, payload) => {
      const { task } = payload || {};
      if (!task) return;

      const targetId = task._id || task.id;

      if (eventType === 'task:created') {
        setTasks((prev) => {
          if (prev.some((t) => (t._id || t.id) === targetId)) return prev;
          return [task, ...prev];
        });
      } else if (eventType === 'task:moved' || eventType === 'task:updated') {
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === targetId ? { ...t, ...task } : t))
        );
      } else if (eventType === 'task:deleted') {
        setTasks((prev) => prev.filter((t) => (t._id || t.id) !== targetId));
      }
    });

    const unsubNotif = onNotification((notif) => {
      setNotifications((prev) => [notif, ...prev]);
      toast.info(notif.title || 'New notification received');
    });

    return () => {
      unsubTask();
      unsubNotif();
    };
  }, [onTaskEvent, onNotification, toast]);

  // Sync active workspace from auth state or localStorage
  useEffect(() => {
    if (currentWorkspace) {
      const workspaceId = currentWorkspace._id || currentWorkspace.id;
      localStorage.setItem('teamflow_active_workspace_id', workspaceId);
      setActiveWorkspace(currentWorkspace);
    } else if (workspaces && workspaces.length > 0) {
      const first = workspaces[0].workspace || workspaces[0];
      const workspaceId = first._id || first.id;
      localStorage.setItem('teamflow_active_workspace_id', workspaceId);
      setActiveWorkspace(first);
    }
  }, [currentWorkspace, workspaces]);

  // Rehydrate all core workspace entities from backend
  const loadWorkspaceData = useCallback(async (targetWorkspaceId) => {
    if (!targetWorkspaceId) return;
    setIsLoading(true);

    try {
      const [membersData, teamsData, projectsData, tasksData, notifsRes] = await Promise.all([
        workspaceService.getMembers(targetWorkspaceId).catch(() => []),
        teamService.getTeams(targetWorkspaceId).catch(() => []),
        projectService.getProjects(targetWorkspaceId).catch(() => ({ projects: [] })),
        taskService.getAllWorkspaceTasks(targetWorkspaceId).catch(() => ({ tasks: [] })),
        notificationService.getMyNotifications().catch(() => ({ data: [] })),
      ]);

      const loadedProjects = projectsData.projects || projectsData || [];
      const loadedTasks = tasksData.tasks || tasksData || [];
      const loadedNotifs = notifsRes.data || [];

      setMembers(membersData || []);
      setTeams(teamsData || []);
      setProjects(loadedProjects);
      setTasks(loadedTasks);
      setNotifications(loadedNotifs);

      // Set active project if not set or if current one not in list
      setActiveProject((prev) => {
        if (prev && loadedProjects.some((p) => (p._id || p.id) === (prev._id || prev.id))) {
          return loadedProjects.find((p) => (p._id || p.id) === (prev._id || prev.id));
        }
        return loadedProjects.length > 0 ? loadedProjects[0] : null;
      });
    } catch (err) {
      console.error('[LoadWorkspaceData Error]', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeWorkspace) {
      const wsId = activeWorkspace._id || activeWorkspace.id;
      loadWorkspaceData(wsId);
    }
  }, [isAuthenticated, activeWorkspace, loadWorkspaceData]);

  // Workspace Operations
  const switchWorkspace = async (workspaceId) => {
    localStorage.setItem('teamflow_active_workspace_id', workspaceId);
    if (authSwitchWorkspace) {
      const target = workspaces.find((w) => (w._id || w.id || w.workspace?._id) === workspaceId);
      if (target) authSwitchWorkspace(target.workspace || target);
    }
    const ws = await workspaceService.getWorkspaceById(workspaceId);
    setActiveWorkspace(ws);
    await loadWorkspaceData(workspaceId);
    toast.info(`Switched to workspace: ${ws.name}`);
  };

  const createWorkspace = async ({ name, description, slug }) => {
    try {
      const ws = await workspaceService.createWorkspace({ name, description, slug });
      toast.success(`Workspace "${ws.name}" created!`);
      await switchWorkspace(ws._id);
      return ws;
    } catch (err) {
      toast.error(err.message || 'Failed to create workspace.');
      throw err;
    }
  };

  const updateWorkspace = async (updateData) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      const updated = await workspaceService.updateWorkspace(wsId, updateData);
      setActiveWorkspace(updated);
      toast.success('Workspace settings updated successfully.');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update workspace.');
      throw err;
    }
  };

  // Member Operations
  const inviteMember = async (email, role) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      const inv = await workspaceService.inviteMember(wsId, { email, role });
      toast.success(`Invitation dispatched to ${email}!`);
      // Reload members list
      const updatedMembers = await workspaceService.getMembers(wsId);
      setMembers(updatedMembers);
      return inv;
    } catch (err) {
      toast.error(err.message || 'Failed to invite member.');
      throw err;
    }
  };

  const updateMemberRole = async (memberId, newRole) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      await workspaceService.updateMemberRole(wsId, memberId, newRole);
      toast.success('Member role updated.');
      const updatedMembers = await workspaceService.getMembers(wsId);
      setMembers(updatedMembers);
    } catch (err) {
      toast.error(err.message || 'Failed to update member role.');
      throw err;
    }
  };

  const removeMember = async (memberId) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      await workspaceService.removeMember(wsId, memberId);
      toast.success('Member removed from workspace.');
      setMembers((prev) => prev.filter((m) => (m._id || m.id) !== memberId));
    } catch (err) {
      toast.error(err.message || 'Failed to remove member.');
      throw err;
    }
  };

  // Team Operations
  const createTeam = async (teamData) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      const team = await teamService.createTeam(wsId, teamData);
      toast.success(`Team "${team.name}" created!`);
      setTeams((prev) => [team, ...prev]);
      return team;
    } catch (err) {
      toast.error(err.message || 'Failed to create team.');
      throw err;
    }
  };

  const updateTeam = async (teamId, teamData) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      const updated = await teamService.updateTeam(wsId, teamId, teamData);
      toast.success(`Team "${updated.name}" updated!`);
      setTeams((prev) => prev.map((t) => ((t._id || t.id) === teamId ? updated : t)));
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update team.');
      throw err;
    }
  };

  const deleteTeam = async (teamId) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      await teamService.deleteTeam(wsId, teamId);
      toast.success('Team deleted.');
      setTeams((prev) => prev.filter((t) => (t._id || t.id) !== teamId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete team.');
      throw err;
    }
  };

  // Project Operations
  const addProject = async (projectData) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    if (!wsId) return;

    try {
      const project = await projectService.createProject(wsId, projectData);
      toast.success(`Project "${project.name}" created!`);
      setProjects((prev) => [project, ...prev]);
      setActiveProject(project);
      return project;
    } catch (err) {
      toast.error(err.message || 'Failed to create project.');
      throw err;
    }
  };

  const updateProject = async (projectId, updateData) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    try {
      const updated = await projectService.updateProject(projectId, updateData, wsId);
      toast.success(`Project "${updated.name}" updated!`);
      setProjects((prev) => prev.map((p) => ((p._id || p.id) === projectId ? updated : p)));
      if (activeProject && (activeProject._id || activeProject.id) === projectId) {
        setActiveProject(updated);
      }
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update project.');
      throw err;
    }
  };

  const deleteProject = async (projectId) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    try {
      await projectService.deleteProject(projectId, wsId);
      toast.success('Project deleted.');
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== projectId));
      setTasks((prev) => prev.filter((t) => (t.projectId?._id || t.projectId) !== projectId));
      setActiveProject((prev) => (prev && (prev._id || prev.id) === projectId ? null : prev));
    } catch (err) {
      toast.error(err.message || 'Failed to delete project.');
      throw err;
    }
  };

  // Task Operations with Optimistic UI and Rollback
  const addTask = async (taskData) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    const pId = taskData.projectId || activeProject?._id || activeProject?.id;
    if (!wsId || !pId) return;

    try {
      const task = await taskService.createTask(pId, taskData, wsId);
      toast.success(`Task "${task.title}" added to board!`);
      setTasks((prev) => [task, ...prev]);

      // Increment project taskCount
      setProjects((prev) =>
        prev.map((p) =>
          (p._id || p.id) === pId
            ? { ...p, taskCount: (p.taskCount || 0) + 1 }
            : p
        )
      );

      return task;
    } catch (err) {
      toast.error(err.message || 'Failed to create task.');
      throw err;
    }
  };

  const updateTask = async (taskId, updateData) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    try {
      const updated = await taskService.updateTask(taskId, updateData, wsId);
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? updated : t)));
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update task.');
      throw err;
    }
  };

  const moveTask = async (taskId, targetColumn, newOrderIndex) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    // Normalize targetColumn to match backend enum
    let normalizedCol = targetColumn;
    if (targetColumn === 'col-todo') normalizedCol = 'todo';
    else if (targetColumn === 'col-inprogress') normalizedCol = 'inprogress';
    else if (targetColumn === 'col-review') normalizedCol = 'review';
    else if (targetColumn === 'col-done') normalizedCol = 'done';

    // 1. Optimistic Update in UI
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        (t._id || t.id) === taskId
          ? { ...t, column: normalizedCol, columnId: `col-${normalizedCol}` }
          : t
      )
    );

    // 2. Persist to Backend API
    try {
      await taskService.moveTask(
        taskId,
        { column: normalizedCol, orderIndex: newOrderIndex },
        wsId
      );
    } catch (err) {
      // 3. Rollback on failure
      setTasks(previousTasks);
      toast.error('Failed to move task. Reverting changes...');
    }
  };

  const deleteTask = async (taskId) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    try {
      await taskService.deleteTask(taskId, wsId);
      toast.success('Task deleted.');
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete task.');
      throw err;
    }
  };

  const addChecklistItem = async (taskId, title) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    try {
      const item = await taskService.addChecklistItem(taskId, title, wsId);
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === taskId
            ? { ...t, checklist: [...(t.checklist || []), item] }
            : t
        )
      );
      return item;
    } catch (err) {
      toast.error(err.message || 'Failed to add checklist item.');
      throw err;
    }
  };

  const toggleChecklistItem = async (taskId, itemId) => {
    const wsId = activeWorkspace?._id || activeWorkspace?.id;
    try {
      const updatedItem = await taskService.toggleChecklistItem(taskId, itemId, wsId);
      setTasks((prev) =>
        prev.map((t) => {
          if ((t._id || t.id) === taskId) {
            const updatedChecklist = (t.checklist || []).map((c) =>
              (c._id || c.id) === itemId ? updatedItem : c
            );
            return { ...t, checklist: updatedChecklist };
          }
          return t;
        })
      );
      return updatedItem;
    } catch (err) {
      toast.error(err.message || 'Failed to toggle checklist item.');
      throw err;
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllRead();
    } catch (e) {
      console.error('[MarkAllRead Error]', e);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.info('All notifications marked as read');
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
    } catch (e) {
      console.error('[MarkNotificationRead Error]', e);
    }
    setNotifications((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
    );
  };

  const currentUser = user || {
    name: 'Team Member',
    email: 'member@teamflow.app',
    role: 'workspace_owner',
    roleTitle: 'Workspace Owner',
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        workspace: activeWorkspace || { name: 'My Workspace', slug: 'workspace' },
        workspaces: workspaces || [],
        projects,
        tasks,
        members,
        teams,
        notifications,
        activeProject: activeProject || projects[0] || { name: 'General', id: 'gen-1' },
        setActiveProject,
        isLoading,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        inviteMember,
        updateMemberRole,
        removeMember,
        createTeam,
        updateTeam,
        deleteTeam,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        moveTask,
        deleteTask,
        addChecklistItem,
        toggleChecklistItem,
        markAllNotificationsRead,
        markNotificationRead,
        refreshData: () => loadWorkspaceData(activeWorkspace?._id || activeWorkspace?.id),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
