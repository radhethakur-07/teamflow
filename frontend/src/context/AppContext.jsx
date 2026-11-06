import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext.jsx';

const AppContext = createContext(null);

const initialMembers = [
  { id: 'usr-1', name: 'Jane Doe', email: 'jane@teamflow.app', role: 'workspace_owner', roleTitle: 'Workspace Owner', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', status: 'active', department: 'Product Design' },
  { id: 'usr-2', name: 'Alex Rivera', email: 'alex@teamflow.app', role: 'admin', roleTitle: 'Administrator', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', status: 'active', department: 'Engineering' },
  { id: 'usr-3', name: 'Maya Lin', email: 'maya@teamflow.app', role: 'project_manager', roleTitle: 'Project Manager', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', status: 'active', department: 'Marketing' },
  { id: 'usr-4', name: 'David Chen', email: 'david@teamflow.app', role: 'team_member', roleTitle: 'Team Member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', status: 'active', department: 'Engineering' },
  { id: 'usr-5', name: 'Sarah Connor', email: 'sarah@teamflow.app', role: 'team_member', roleTitle: 'Team Member', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', status: 'active', department: 'Content' },
];

const initialProjects = [
  {
    id: 'proj-1',
    name: 'Mobile App Redesign',
    slug: 'mobile-app-redesign',
    description: 'Next-generation iOS & Android application redesign focusing on warm typography and tactile micro-interactions.',
    color: '#E98269', // Terracotta
    status: 'active',
    taskCount: 14,
    completedCount: 6,
    lead: initialMembers[0],
    members: [initialMembers[0], initialMembers[1], initialMembers[3]],
    dueDate: '2026-11-28',
  },
  {
    id: 'proj-2',
    name: 'Design System 2.0',
    slug: 'design-system-2',
    description: 'Comprehensive tokenization, Figma library alignment, and accessible React UI component primitives.',
    color: '#91A88C', // Sage
    status: 'active',
    taskCount: 9,
    completedCount: 7,
    lead: initialMembers[1],
    members: [initialMembers[0], initialMembers[1]],
    dueDate: '2026-12-05',
  },
  {
    id: 'proj-3',
    name: 'Customer Onboarding Revamp',
    slug: 'onboarding-revamp',
    description: 'Streamlining time-to-first-task from 4 minutes down to 60 seconds with self-guided interactive tour.',
    color: '#E9C995', // Mustard
    status: 'active',
    taskCount: 11,
    completedCount: 4,
    lead: initialMembers[2],
    members: [initialMembers[2], initialMembers[4]],
    dueDate: '2026-12-15',
  },
  {
    id: 'proj-4',
    name: 'Security & SOC-2 Compliance',
    slug: 'security-compliance',
    description: 'Audit trails, role-based access policies, credential isolation and automated penetration scanning.',
    color: '#C9B8D9', // Lavender
    status: 'active',
    taskCount: 8,
    completedCount: 3,
    lead: initialMembers[1],
    members: [initialMembers[1], initialMembers[3]],
    dueDate: '2027-01-20',
  },
];

const initialTasks = [
  {
    id: 'task-101',
    projectId: 'proj-1',
    columnId: 'col-todo',
    title: 'Audit mobile navigation touch targets for WCAG 2.1 AA',
    description: 'Ensure all bottom bar and header touch targets exceed 44x44px and provide visible tactile active states.',
    priority: 'high',
    dueDate: '2026-11-12',
    assignees: [initialMembers[0]],
    tags: ['UX Audit', 'Accessibility'],
    checklist: [
      { id: 'chk-1', text: 'Measure tab bar hit areas', completed: true },
      { id: 'chk-2', text: 'Verify 4.5:1 text contrast on Warm Ivory', completed: false },
      { id: 'chk-3', text: 'Test with VoiceOver screen reader', completed: false },
    ],
    commentsCount: 3,
  },
  {
    id: 'task-102',
    projectId: 'proj-1',
    columnId: 'col-inprogress',
    title: 'Implement Terracotta button variants and focus rings',
    description: 'Create primary, secondary, and ghost buttons with warm terracotta hover transitions and offset focus rings.',
    priority: 'urgent',
    dueDate: '2026-11-10',
    assignees: [initialMembers[1], initialMembers[0]],
    tags: ['Components', 'Design Tokens'],
    checklist: [
      { id: 'chk-4', text: 'Export SVG icon alignments', completed: true },
      { id: 'chk-5', text: 'Implement loading spinner transitions', completed: true },
    ],
    commentsCount: 5,
  },
  {
    id: 'task-103',
    projectId: 'proj-1',
    columnId: 'col-review',
    title: 'Prototype drag-and-drop Kanban card animations',
    description: 'Fluid 1.5-degree card tilt upon grab, soft warm shadow elevation, and instant placeholder positioning.',
    priority: 'medium',
    dueDate: '2026-11-14',
    assignees: [initialMembers[3]],
    tags: ['Kanban', 'Micro-Interactions'],
    checklist: [
      { id: 'chk-6', text: 'Smooth column entry transitions', completed: true },
      { id: 'chk-7', text: 'Keyboard spacebar pick-and-drop test', completed: true },
    ],
    commentsCount: 2,
  },
  {
    id: 'task-104',
    projectId: 'proj-1',
    columnId: 'col-done',
    title: 'Setup Vite monorepo with Plus Jakarta Sans & DM Sans',
    description: 'Font pre-connect links in index.html and Tailwind configuration extended with warm editorial tokens.',
    priority: 'low',
    dueDate: '2026-11-06',
    assignees: [initialMembers[1]],
    tags: ['Foundation'],
    checklist: [
      { id: 'chk-8', text: 'Test font rendering on Windows & macOS', completed: true },
    ],
    commentsCount: 1,
  },
  {
    id: 'task-105',
    projectId: 'proj-2',
    columnId: 'col-todo',
    title: 'Define token naming conventions for warm ivory surfaces',
    description: 'Standardize warm-50 through warm-900 palette roles and semantic aliases across React and Tailwind.',
    priority: 'medium',
    dueDate: '2026-11-18',
    assignees: [initialMembers[0]],
    tags: ['Design System'],
    checklist: [],
    commentsCount: 0,
  },
  {
    id: 'task-106',
    projectId: 'proj-3',
    columnId: 'col-inprogress',
    title: 'Design interactive workspace setup modal stepper',
    description: 'Three-step onboarding flow: Workspace Name, Team Size & Roles, First Project Selection.',
    priority: 'high',
    dueDate: '2026-11-16',
    assignees: [initialMembers[2]],
    tags: ['Onboarding', 'Growth'],
    checklist: [
      { id: 'chk-9', text: 'Step 1: Workspace creation input', completed: true },
      { id: 'chk-10', text: 'Step 2: Team invite token link', completed: false },
    ],
    commentsCount: 4,
  },
];

const initialNotifications = [
  { id: 'notif-1', title: 'Alex Rivera assigned you to a task', message: 'Implement Terracotta button variants and focus rings', time: '10m ago', read: false, type: 'ASSIGNED', link: '/board' },
  { id: 'notif-2', title: 'Maya Lin commented on your project', message: '"The onboarding flow designs look warm and friendly!"', time: '1h ago', read: false, type: 'COMMENT', link: '/projects/proj-3' },
  { id: 'notif-3', title: 'Milestone 1 Completed', message: 'Backend health check and Vite connection tests verified.', time: '2h ago', read: true, type: 'SYSTEM', link: '/status' },
  { id: 'notif-4', title: 'Due date reminder', message: 'Audit mobile navigation touch targets is due in 3 days.', time: 'Yesterday', read: true, type: 'DUE', link: '/my-tasks' },
];

export const AppProvider = ({ children }) => {
  const toast = useToast();
  const [currentUser] = useState(initialMembers[0]);
  const [workspace] = useState({
    id: 'ws-1',
    name: 'Acme Product Studio',
    slug: 'acme-studio',
    plan: 'Pro Plan',
    membersCount: initialMembers.length,
    avatar: 'TF',
  });

  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [members, setMembers] = useState(initialMembers);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeProject, setActiveProject] = useState(initialProjects[0]);

  // Task actions
  const moveTask = (taskId, targetColumnId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t))
    );
    toast.success('Task moved successfully');
  };

  const addTask = (newTask) => {
    const task = {
      id: `task-${Date.now()}`,
      projectId: activeProject.id,
      columnId: 'col-todo',
      checklist: [],
      commentsCount: 0,
      assignees: [currentUser],
      tags: ['General'],
      ...newTask,
    };
    setTasks((prev) => [task, ...prev]);
    toast.success(`Task "${task.title}" created!`);
    return task;
  };

  const toggleChecklistItem = (taskId, itemId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((c) =>
          c.id === itemId ? { ...c, completed: !c.completed } : c
        );
        return { ...t, checklist: updatedChecklist };
      })
    );
  };

  const addProject = (projectData) => {
    const newProj = {
      id: `proj-${Date.now()}`,
      slug: projectData.name.toLowerCase().replace(/\s+/g, '-'),
      taskCount: 0,
      completedCount: 0,
      lead: currentUser,
      members: [currentUser],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ...projectData,
    };
    setProjects((prev) => [newProj, ...prev]);
    toast.success(`Project "${newProj.name}" created!`);
    return newProj;
  };

  const inviteMember = (email, role) => {
    const newMember = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      role,
      roleTitle: role === 'admin' ? 'Administrator' : role === 'project_manager' ? 'Project Manager' : 'Team Member',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      status: 'invited',
      department: 'Invited Member',
    };
    setMembers((prev) => [...prev, newMember]);
    toast.success(`Invitation sent to ${email}!`);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.info('All notifications marked as read');
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        workspace,
        projects,
        tasks,
        members,
        notifications,
        activeProject,
        setActiveProject,
        moveTask,
        addTask,
        toggleChecklistItem,
        addProject,
        inviteMember,
        markAllNotificationsRead,
        markNotificationRead,
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
