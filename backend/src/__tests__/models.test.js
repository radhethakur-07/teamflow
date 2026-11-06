import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import {
  User,
  Workspace,
  WorkspaceMember,
  Team,
  Project,
  Task,
  Comment,
  Notification,
  Message,
  Invitation,
  Attachment,
  ActivityLog,
} from '../models/index.js';

let mongod;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});

test('Model Suite: creates and validates all 12 Mongoose models', async (t) => {
  // 1. User Model
  const user = await User.create({
    name: 'Backend Architect',
    email: 'architect@teamflow.app',
    passwordHash: 'hashed_password_12345',
    status: 'active',
    jobTitle: 'Senior Architect',
  });
  assert.ok(user._id);
  assert.equal(user.email, 'architect@teamflow.app');
  assert.equal(user.toSafeJSON().passwordHash, undefined);

  // 2. Workspace Model
  const workspace = await Workspace.create({
    name: 'Engineering Labs',
    slug: 'eng-labs',
    ownerId: user._id,
    plan: 'pro',
  });
  assert.ok(workspace._id);
  assert.equal(workspace.name, 'Engineering Labs');

  // 3. WorkspaceMember Model
  const member = await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: user._id,
    role: 'workspace_owner',
  });
  assert.ok(member._id);
  assert.equal(member.role, 'workspace_owner');

  // 4. Team Model
  const team = await Team.create({
    workspaceId: workspace._id,
    name: 'Core Platform Team',
    description: 'Backend services & database infrastructure',
    leadId: user._id,
    memberIds: [user._id],
  });
  assert.ok(team._id);
  assert.equal(team.name, 'Core Platform Team');

  // 5. Project Model
  const project = await Project.create({
    workspaceId: workspace._id,
    teamId: team._id,
    name: 'API v1 Infrastructure',
    slug: 'api-v1-infra',
    leadId: user._id,
    memberIds: [user._id],
    color: '#E98269',
  });
  assert.ok(project._id);
  assert.equal(project.slug, 'api-v1-infra');

  // 6. Task Model
  const task = await Task.create({
    workspaceId: workspace._id,
    projectId: project._id,
    title: 'Implement 12 Mongoose Models',
    description: 'Ensure proper indexes, references, and validation',
    priority: 'urgent',
    column: 'inprogress',
    orderIndex: 1000,
    creatorId: user._id,
    assigneeIds: [user._id],
    tags: ['backend', 'database'],
    checklist: [
      { title: 'Define ObjectId refs', completed: true },
      { title: 'Add compound indexes', completed: true },
    ],
  });
  assert.ok(task._id);
  assert.equal(task.title, 'Implement 12 Mongoose Models');
  assert.equal(task.checklist.length, 2);

  // 7. Comment Model
  const comment = await Comment.create({
    workspaceId: workspace._id,
    taskId: task._id,
    authorId: user._id,
    content: 'All models verified with compound indexes and timestamps.',
  });
  assert.ok(comment._id);
  assert.equal(comment.content, 'All models verified with compound indexes and timestamps.');

  // 8. Notification Model
  const notif = await Notification.create({
    userId: user._id,
    workspaceId: workspace._id,
    type: 'ASSIGNED',
    title: 'Task Assigned',
    message: 'You have been assigned to Implement 12 Mongoose Models',
  });
  assert.ok(notif._id);
  assert.equal(notif.read, false);

  // 9. Message Model
  const message = await Message.create({
    workspaceId: workspace._id,
    senderId: user._id,
    channelId: 'backend-eng',
    content: 'Deployment pipeline green!',
  });
  assert.ok(message._id);
  assert.equal(message.content, 'Deployment pipeline green!');

  // 10. Invitation Model
  const invitation = await Invitation.create({
    workspaceId: workspace._id,
    email: 'newhire@teamflow.app',
    role: 'project_manager',
    token: 'crypto_token_secure_999',
    invitedBy: user._id,
    expiresAt: new Date(Date.now() + 86400000),
  });
  assert.ok(invitation._id);
  assert.equal(invitation.email, 'newhire@teamflow.app');

  // 11. Attachment Model
  const attachment = await Attachment.create({
    workspaceId: workspace._id,
    taskId: task._id,
    uploaderId: user._id,
    fileName: 'system-architecture.pdf',
    fileUrl: 'https://cdn.teamflow.app/docs/system-architecture.pdf',
    fileSize: 1024500,
  });
  assert.ok(attachment._id);
  assert.equal(attachment.fileName, 'system-architecture.pdf');

  // 12. ActivityLog Model
  const activity = await ActivityLog.create({
    workspaceId: workspace._id,
    projectId: project._id,
    taskId: task._id,
    actorId: user._id,
    action: 'TASK_CREATED',
    details: { title: task.title },
  });
  assert.ok(activity._id);
  assert.equal(activity.action, 'TASK_CREATED');
});
