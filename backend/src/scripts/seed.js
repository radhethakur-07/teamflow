import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Team } from '../models/Team.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Attachment } from '../models/Attachment.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { hashPassword } from '../utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seed = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment. Exiting.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected! Seeding initial TeamFlow production workspace...');

  const pwHash = await hashPassword('Password123!');

  // 1. Seed Users
  const usersData = [
    {
      name: 'Alice Cooper',
      email: 'alice@teamflow.app',
      jobTitle: 'VP of Product & Engineering',
      bio: 'Leading product engineering at Acme Innovation Lab.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'Bob Dev',
      email: 'bob@teamflow.app',
      jobTitle: 'Senior Full-Stack Engineer',
      bio: 'TypeScript, React, Node.js enthusiast.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      name: 'Elena Designer',
      email: 'elena@teamflow.app',
      jobTitle: 'Lead Design Systems Architect',
      bio: 'Obsessed with warm editorial typography and WCAG AA contrast.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      name: 'Marcus Project',
      email: 'marcus@teamflow.app',
      jobTitle: 'Technical Project Manager',
      bio: 'Keeping velocity high and sprints organized.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  ];

  const users = [];
  for (const u of usersData) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({
        ...u,
        passwordHash: pwHash,
        status: 'active',
        isEmailVerified: true,
      });
    }
    users.push(user);
  }

  const [alice, bob, elena, marcus] = users;

  // 2. Seed Workspace
  let workspace = await Workspace.findOne({ slug: 'acme-innovation-lab' });
  if (!workspace) {
    workspace = await Workspace.create({
      name: 'Acme Innovation Lab',
      slug: 'acme-innovation-lab',
      ownerId: alice._id,
      description: 'Modern product engineering, design systems, and cloud infrastructure squad.',
    });
  }

  // 3. Seed Members
  const memberRoles = [
    { user: alice, role: 'workspace_owner' },
    { user: marcus, role: 'project_manager' },
    { user: bob, role: 'team_member' },
    { user: elena, role: 'team_member' },
  ];

  for (const mr of memberRoles) {
    const existing = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: mr.user._id,
    });
    if (!existing) {
      await WorkspaceMember.create({
        workspaceId: workspace._id,
        userId: mr.user._id,
        role: mr.role,
        status: 'active',
      });
    }
  }

  // 4. Seed Teams
  let coreTeam = await Team.findOne({ workspaceId: workspace._id, name: 'Core Engineering Squad' });
  if (!coreTeam) {
    coreTeam = await Team.create({
      workspaceId: workspace._id,
      name: 'Core Engineering Squad',
      description: 'Responsible for backend architecture, REST APIs, and Socket.IO real-time engine.',
      leadId: alice._id,
      memberIds: [alice._id, bob._id, marcus._id],
    });
  }

  let designTeam = await Team.findOne({ workspaceId: workspace._id, name: 'Design & Brand Systems' });
  if (!designTeam) {
    designTeam = await Team.create({
      workspaceId: workspace._id,
      name: 'Design & Brand Systems',
      description: 'Tactile editorial design system, typography, and frontend accessibility.',
      leadId: elena._id,
      memberIds: [elena._id, alice._id],
    });
  }

  // 5. Seed Projects
  const now = new Date();
  const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const pastThreeDays = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const projectsData = [
    {
      name: 'Mobile App 2.0 Redesign',
      slug: 'mobile-app-2-0',
      description: 'Revamping mobile interface with tactile touch gestures and sub-100ms sync.',
      color: '#E98269', // Terracotta
      coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
      teamId: designTeam._id,
      leadId: elena._id,
      memberIds: [elena._id, bob._id, alice._id],
      dueDate: nextTwoWeeks,
    },
    {
      name: 'Cloud Security Architecture',
      slug: 'cloud-security-architecture',
      description: 'Zero-trust network configuration, OAuth 2.0 refresh rotation, and RBAC.',
      color: '#91A88C', // Sage Green
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      teamId: coreTeam._id,
      leadId: bob._id,
      memberIds: [bob._id, alice._id, marcus._id],
      dueDate: nextMonth,
    },
  ];

  const projects = [];
  for (const pd of projectsData) {
    let proj = await Project.findOne({ workspaceId: workspace._id, slug: pd.slug });
    if (!proj) {
      proj = await Project.create({
        workspaceId: workspace._id,
        ...pd,
      });
    }
    projects.push(proj);
  }

  // 6. Seed Tasks
  const [mobileProj, cloudProj] = projects;

  const tasksData = [
    {
      projectId: mobileProj._id,
      title: 'Design high-fidelity Figma components with Plus Jakarta Sans',
      column: 'done',
      priority: 'high',
      creatorId: elena._id,
      assigneeIds: [elena._id],
      dueDate: pastThreeDays,
      description: 'Establish design tokens and accessible typography hierarchy across all mobile views.',
    },
    {
      projectId: mobileProj._id,
      title: 'Implement native HTML5 optimistic drag-and-drop',
      column: 'inprogress',
      priority: 'urgent',
      creatorId: alice._id,
      assigneeIds: [bob._id],
      dueDate: nextTwoWeeks,
      description: 'Provide immediate UI responsiveness with automatic rollback on network disruption.',
    },
    {
      projectId: mobileProj._id,
      title: 'Implement swipe navigation for mobile tablet drawer',
      column: 'todo',
      priority: 'medium',
      creatorId: elena._id,
      assigneeIds: [bob._id],
      dueDate: nextTwoWeeks,
      description: 'Add touch-gesture handles for navigating between projects and channels on iPad/iPhone.',
    },
    {
      projectId: cloudProj._id,
      title: 'Setup HttpOnly token rotation with reuse family invalidation',
      column: 'done',
      priority: 'urgent',
      creatorId: alice._id,
      assigneeIds: [bob._id],
      dueDate: pastThreeDays,
      description: 'Ensure compromised token families are completely revoked on replay detection.',
    },
    {
      projectId: cloudProj._id,
      title: 'Configure Render WebSocket upgrade and keep-alive heartbeats',
      column: 'inprogress',
      priority: 'high',
      creatorId: bob._id,
      assigneeIds: [bob._id, alice._id],
      dueDate: nextMonth,
      description: 'Tune pingInterval to 25s and pingTimeout to 60s for Render production proxy.',
    },
  ];

  for (const td of tasksData) {
    const existing = await Task.findOne({
      projectId: td.projectId,
      title: td.title,
    });
    if (!existing) {
      const task = await Task.create({
        workspaceId: workspace._id,
        ...td,
        checklist: [
          { title: 'Define acceptance criteria', completed: true },
          { title: 'Write automated unit tests', completed: td.column === 'done' },
          { title: 'Peer review and security scan', completed: false },
        ],
      });

      // Add sample comment
      await Comment.create({
        workspaceId: workspace._id,
        taskId: task._id,
        authorId: alice._id,
        content: `Great progress on this! Let's ensure this is thoroughly verified across all browsers.`,
      });

      // Add activity log
      await ActivityLog.create({
        workspaceId: workspace._id,
        projectId: td.projectId,
        taskId: task._id,
        actorId: alice._id,
        action: 'TASK_CREATED',
        details: { title: td.title, priority: td.priority },
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
  console.log('Sample User credentials:');
  console.log('  Email:    alice@teamflow.app');
  console.log('  Password: Password123!');
  console.log('  Workspace: Acme Innovation Lab (/app)');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
