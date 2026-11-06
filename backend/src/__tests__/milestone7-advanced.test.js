import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Attachment } from '../models/Attachment.js';
import { generateTokens } from '../utils/jwt.js';
import { hashPassword } from '../utils/password.js';

let mongod;
let server;
let baseUrl;

let alice, bob, mallory;
let aliceToken, bobToken, malloryToken;
let workspace, project, task;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const pwHash = await hashPassword('Password123!');

  alice = await User.create({
    name: 'Alice Cooper',
    email: 'alice.lead@teamflow.app',
    passwordHash: pwHash,
    status: 'active',
    isEmailVerified: true,
  });

  bob = await User.create({
    name: 'Bob Dev',
    email: 'bob.dev@teamflow.app',
    passwordHash: pwHash,
    status: 'active',
    isEmailVerified: true,
  });

  mallory = await User.create({
    name: 'Mallory Hacker',
    email: 'mallory@externalcorp.com',
    passwordHash: pwHash,
    status: 'active',
    isEmailVerified: true,
  });

  aliceToken = generateTokens(alice).accessToken;
  bobToken = generateTokens(bob).accessToken;
  malloryToken = generateTokens(mallory).accessToken;

  workspace = await Workspace.create({
    name: 'SaaS Innovators Inc',
    slug: 'saas-innovators',
    ownerId: alice._id,
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: alice._id,
    role: 'workspace_owner',
    status: 'active',
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: bob._id,
    role: 'team_member',
    status: 'active',
  });

  project = await Project.create({
    workspaceId: workspace._id,
    name: 'NextGen Cloud Architecture',
    slug: 'nextgen-cloud',
    ownerId: alice._id,
    memberIds: [alice._id, bob._id],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  // Seed tasks: 1 todo, 1 inprogress, 1 done, 1 overdue
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  task = await Task.create({
    workspaceId: workspace._id,
    projectId: project._id,
    creatorId: alice._id,
    assigneeIds: [bob._id],
    title: 'Deploy Kubernetes ingress controller',
    column: 'todo',
    priority: 'urgent',
    dueDate: nextWeek,
  });

  await Task.create({
    workspaceId: workspace._id,
    projectId: project._id,
    creatorId: alice._id,
    assigneeIds: [bob._id],
    title: 'Setup Redis connection pooling',
    column: 'inprogress',
    priority: 'high',
    dueDate: nextWeek,
  });

  await Task.create({
    workspaceId: workspace._id,
    projectId: project._id,
    creatorId: alice._id,
    assigneeIds: [alice._id],
    title: 'Draft security threat model',
    column: 'done',
    priority: 'medium',
    dueDate: yesterday,
  });

  await Task.create({
    workspaceId: workspace._id,
    projectId: project._id,
    creatorId: alice._id,
    assigneeIds: [bob._id],
    title: 'Renew wildcard SSL certificate',
    column: 'todo',
    priority: 'urgent',
    dueDate: yesterday, // OVERDUE!
  });
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Milestone 7 Advanced Suite: Real Analytics Aggregations, Cloudinary/Attachments, and User Preferences', async (t) => {
  await t.test('1. Analytics: returns accurate real database metrics and project completion %', async () => {
    const res = await fetch(`${baseUrl}/workspaces/${workspace._id}/analytics`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        'x-workspace-id': workspace._id.toString(),
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const { taskBreakdown, projectMetrics, overdueSummary, teamWorkload } = body.data;

    // 4 tasks: 2 todo, 1 inprogress, 1 done
    assert.equal(taskBreakdown.total, 4);
    assert.equal(taskBreakdown.todo, 2);
    assert.equal(taskBreakdown.inprogress, 1);
    assert.equal(taskBreakdown.done, 1);

    // Overdue tasks: 1 overdue
    assert.equal(overdueSummary.count, 1);
    assert.equal(overdueSummary.tasks[0].title, 'Renew wildcard SSL certificate');

    // Project completion: 1 completed of 4 tasks = 25%
    assert.equal(projectMetrics.length, 1);
    assert.equal(projectMetrics[0].completionPercentage, 25);
    assert.equal(projectMetrics[0].totalTasks, 4);
    assert.equal(projectMetrics[0].completedTasks, 1);
    assert.equal(projectMetrics[0].overdueTasks, 1);

    // Team workload
    assert.ok(teamWorkload.length >= 2);
    const bobWorkload = teamWorkload.find((m) => m.name === 'Bob Dev');
    assert.ok(bobWorkload);
    assert.equal(bobWorkload.assignedCount, 3);
  });

  await t.test('2. Analytics: respects timeframe parameter (7d, 30d, all)', async () => {
    const res = await fetch(`${baseUrl}/workspaces/${workspace._id}/analytics?timeframe=7d`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        'x-workspace-id': workspace._id.toString(),
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.timeframe, '7d');
    assert.equal(body.data.activityVelocity.periodDays, 7);
  });

  await t.test('3. File Attachments: upload valid attachment to task and retrieve list', async () => {
    // Bob uploads an architectural diagram
    const uploadRes = await fetch(`${baseUrl}/tasks/${task._id}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': workspace._id.toString(),
      },
      body: JSON.stringify({
        fileName: 'k8s-cluster-architecture.png',
        fileUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
        fileSize: 1024 * 512, // 512 KB
        mimeType: 'image/png',
      }),
    });

    assert.equal(uploadRes.status, 201);
    const uploadBody = await uploadRes.json();
    assert.equal(uploadBody.success, true);
    assert.equal(uploadBody.data.fileName, 'k8s-cluster-architecture.png');
    assert.equal(uploadBody.data.taskId, task._id.toString());
    const attachmentId = uploadBody.data._id;

    // Fetch attachments
    const listRes = await fetch(`${baseUrl}/tasks/${task._id}/attachments`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        'x-workspace-id': workspace._id.toString(),
      },
    });
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.data.length, 1);
    assert.equal(listBody.data[0]._id, attachmentId);
  });

  await t.test('4. File Attachments: rejects files exceeding 10MB', async () => {
    const res = await fetch(`${baseUrl}/tasks/${task._id}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': workspace._id.toString(),
      },
      body: JSON.stringify({
        fileName: 'huge-database-dump.sql',
        fileUrl: 'https://example.com/huge.sql',
        fileSize: 15 * 1024 * 1024, // 15 MB > 10 MB limit
        mimeType: 'text/plain',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.message.includes('10MB'));
  });

  await t.test('5. File Attachments: deletes attachment with author permissions', async () => {
    // Create attachment to delete
    const att = await Attachment.create({
      workspaceId: workspace._id,
      taskId: task._id,
      uploaderId: bob._id,
      fileName: 'temporary-notes.pdf',
      fileUrl: 'https://example.com/temp.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    });

    const delRes = await fetch(`${baseUrl}/tasks/${task._id}/attachments/${att._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': workspace._id.toString(),
      },
    });

    assert.equal(delRes.status, 200);
    const checkDb = await Attachment.findById(att._id);
    assert.equal(checkDb, null);
  });

  await t.test('6. Cloudinary: upload signature endpoint returns signature with dev fallback', async () => {
    const res = await fetch(`${baseUrl}/upload/signature?folder=teamflow/project_covers`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
      },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.signature);
    assert.equal(body.data.folder, 'teamflow/project_covers');
  });

  await t.test('7. User Profile Preferences: updates notification preferences', async () => {
    const res = await fetch(`${baseUrl}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({
        jobTitle: 'Principal Cloud Architect',
        preferences: {
          emailTaskAssigned: false,
          emailComments: true,
          emailDueSoon: true,
          inAppNotifications: true,
          theme: 'warm',
        },
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const updatedUser = body.data.user || body.data;
    assert.equal(updatedUser.jobTitle, 'Principal Cloud Architect');
    assert.equal(updatedUser.preferences.emailTaskAssigned, false);
    assert.equal(updatedUser.preferences.emailComments, true);
  });
});
