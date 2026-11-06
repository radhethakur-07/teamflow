import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Team } from '../models/Team.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';
import { Attachment } from '../models/Attachment.js';
import { generateTokens } from '../utils/jwt.js';
import { hashPassword } from '../utils/password.js';

let mongod;
let server;
let baseUrl;

let aliceUser, bobUser, malloryUser;
let aliceToken, bobToken, malloryToken;
let workspace, project, task, team;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api/v1`;

  const pwHash = await hashPassword('Password123!');

  aliceUser = await User.create({
    name: 'Alice Cooper',
    email: 'alice.m8@teamflow.app',
    passwordHash: pwHash,
    status: 'active',
    isEmailVerified: true,
  });

  bobUser = await User.create({
    name: 'Bob Dev',
    email: 'bob.m8@teamflow.app',
    passwordHash: pwHash,
    status: 'active',
    isEmailVerified: true,
  });

  malloryUser = await User.create({
    name: 'Mallory External',
    email: 'mallory.m8@untrusted.com',
    passwordHash: pwHash,
    status: 'active',
    isEmailVerified: true,
  });

  aliceToken = generateTokens(aliceUser).accessToken;
  bobToken = generateTokens(bobUser).accessToken;
  malloryToken = generateTokens(malloryUser).accessToken;

  // Alice creates her private workspace
  workspace = await Workspace.create({
    name: 'Production Engineering Lab',
    slug: 'prod-eng-lab',
    ownerId: aliceUser._id,
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: aliceUser._id,
    role: 'workspace_owner',
    status: 'active',
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: bobUser._id,
    role: 'team_member',
    status: 'active',
  });

  // Mallory has her own completely separate workspace
  const malloryWs = await Workspace.create({
    name: 'Mallory Workspace',
    slug: 'mallory-ws',
    ownerId: malloryUser._id,
  });
  await WorkspaceMember.create({
    workspaceId: malloryWs._id,
    userId: malloryUser._id,
    role: 'workspace_owner',
    status: 'active',
  });
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  await new Promise((resolve) => server.close(resolve));
});

test('Milestone 8 QA & Production E2E Verification Suite', async (t) => {
  let createdTaskId;
  let createdAttachmentId;

  await t.test('1. Critical E2E Workflow: Project, Team, and Task Lifecycle', async () => {
    // A. Create Team
    const teamRes = await fetch(`${baseUrl}/workspaces/${workspace._id}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        name: 'Core Platform Squad',
        leadId: aliceUser._id.toString(),
        memberIds: [bobUser._id.toString()],
      }),
    });
    assert.strictEqual(teamRes.status, 201);
    const teamData = await teamRes.json();
    team = teamData.data;
    assert.strictEqual(team.name, 'Core Platform Squad');

    // B. Create Project
    const projRes = await fetch(`${baseUrl}/workspaces/${workspace._id}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        name: 'Q4 Production Launch',
        description: 'Hardening and verification for production release',
        color: '#E98269',
        targetDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      }),
    });
    assert.strictEqual(projRes.status, 201);
    const projData = await projRes.json();
    project = projData.data;
    assert.strictEqual(project.name, 'Q4 Production Launch');

    // C. Create Task
    const taskRes = await fetch(`${baseUrl}/projects/${project._id}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        title: 'Complete security audit & verify penetration tests',
        priority: 'urgent',
        assigneeId: bobUser._id.toString(),
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      }),
    });
    assert.strictEqual(taskRes.status, 201);
    const taskData = await taskRes.json();
    task = taskData.data;
    createdTaskId = task._id;
    assert.strictEqual(task.column, 'todo');
    assert.strictEqual(task.priority, 'urgent');

    // D. Move Task through Kanban workflow (todo -> inprogress -> done)
    const moveRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ column: 'inprogress' }),
    });
    assert.strictEqual(moveRes.status, 200);
    const moved = await moveRes.json();
    assert.strictEqual(moved.data.column, 'inprogress');

    const doneRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ column: 'done' }),
    });
    assert.strictEqual(doneRes.status, 200);
    const completedTask = await doneRes.json();
    assert.strictEqual(completedTask.data.column, 'done');

    // E. Add task comment
    const commentRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
      },
      body: JSON.stringify({ content: 'All automated tests and audits passing with zero errors!' }),
    });
    assert.strictEqual(commentRes.status, 201);
    const commentData = await commentRes.json();
    assert.strictEqual(commentData.data.content, 'All automated tests and audits passing with zero errors!');

    // F. Upload Task Attachment
    const attRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        fileName: 'security-audit-report.pdf',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/security-audit-report.pdf',
        fileSize: 45000,
        mimeType: 'application/pdf',
      }),
    });
    assert.strictEqual(attRes.status, 201);
    const attData = await attRes.json();
    createdAttachmentId = attData.data._id;
    assert.strictEqual(attData.data.fileName, 'security-audit-report.pdf');

    // G. Verify Real Database Analytics Engine
    const analyticsRes = await fetch(`${baseUrl}/workspaces/${workspace._id}/analytics`, {
      headers: { Authorization: `Bearer ${aliceToken}`, 'x-workspace-id': workspace._id.toString() },
    });
    assert.strictEqual(analyticsRes.status, 200);
    const analyticsData = await analyticsRes.json();
    assert.strictEqual(analyticsData.data.taskBreakdown.done, 1);
    assert.strictEqual(analyticsData.data.taskBreakdown.total, 1);
    assert.strictEqual(analyticsData.data.projectMetrics[0].completionPercentage, 100);
  });

  await t.test('2. Security Audit: Multi-Tenant IDOR Attack Defense', async () => {
    // Mallory attempts to read Alice's project
    const idorProj = await fetch(`${baseUrl}/projects/${project._id}`, {
      headers: { Authorization: `Bearer ${malloryToken}` },
    });
    assert.strictEqual(idorProj.status, 403);

    // Mallory attempts to modify Alice's task
    const idorTask = await fetch(`${baseUrl}/tasks/${createdTaskId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${malloryToken}`,
      },
      body: JSON.stringify({ column: 'todo' }),
    });
    assert.strictEqual(idorTask.status, 403);

    // Mallory attempts to delete Alice's task attachment
    const idorAtt = await fetch(`${baseUrl}/tasks/${createdTaskId}/attachments/${createdAttachmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${malloryToken}` },
    });
    assert.strictEqual(idorAtt.status, 403);

    // Mallory attempts to view Alice's workspace analytics
    const idorAnalytics = await fetch(`${baseUrl}/workspaces/${workspace._id}/analytics`, {
      headers: { Authorization: `Bearer ${malloryToken}` },
    });
    assert.strictEqual(idorAnalytics.status, 403);
  });

  await t.test('3. Security Audit: RBAC Role Boundary Enforcement', async () => {
    // Bob (standard team_member) attempts to delete project -> Forbidden
    const delProj = await fetch(`${baseUrl}/projects/${project._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    assert.strictEqual(delProj.status, 403);

    // Bob attempts to delete team -> Forbidden
    const delTeam = await fetch(`${baseUrl}/workspaces/${workspace._id}/teams/${team._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    assert.strictEqual(delTeam.status, 403);
  });

  await t.test('4. Security Audit: Unauthenticated & Malformed Request Rejection', async () => {
    // Request with no token
    const noAuth = await fetch(`${baseUrl}/workspaces/${workspace._id}/projects`);
    assert.strictEqual(noAuth.status, 401);

    // Request with forged / garbage token
    const badToken = await fetch(`${baseUrl}/workspaces/${workspace._id}/projects`, {
      headers: { Authorization: 'Bearer forged.token.signature' },
    });
    assert.strictEqual(badToken.status, 401);

    // Malformed request body failing Zod schema (empty title violates min(1))
    const malformed = await fetch(`${baseUrl}/projects/${project._id}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({ title: '' }),
    });
    assert.strictEqual(malformed.status, 400);
  });

  await t.test('5. Security Audit: File Upload Boundaries (10MB Max Limit)', async () => {
    const oversize = await fetch(`${baseUrl}/tasks/${createdTaskId}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        fileName: 'giant-archive.zip',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/giant-archive.zip',
        fileSize: 15 * 1024 * 1024, // 15MB exceeds 10MB limit
        mimeType: 'application/zip',
      }),
    });
    assert.strictEqual(oversize.status, 400);
    const body = await oversize.json();
    assert.match(body.error.message, /10MB/);
  });

  await t.test('6. Production Diagnostic: Health Probes & Rate Limit Headers', async () => {
    // Liveness probe
    const health = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    assert.strictEqual(health.status, 200);
    const healthData = await health.json();
    assert.strictEqual(healthData.success, true);
    assert.strictEqual(healthData.data.status, 'healthy');

    // Rate limit headers presence
    assert.ok(health.headers.get('ratelimit-limit'));
    assert.ok(health.headers.get('ratelimit-remaining'));
  });
});
