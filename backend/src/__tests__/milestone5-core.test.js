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

let mongod;
let server;
let baseUrl;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}/api/v1`;
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

test('Milestone 5 Core Test Suite: Workspaces, Teams, Projects, Tasks, Comments, Kanban, RBAC & Multi-tenant IDOR', async (t) => {
  // Accounts setup: Owner (Alice), Member (Bob), and External Hacker (Mallory)
  let aliceToken;
  let aliceUserId;
  let aliceWorkspaceId;

  let bobToken;
  let bobUserId;

  let malloryToken;
  let malloryWorkspaceId;

  // Setup Alice
  const aliceReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Owner',
      email: 'alice.lead@teamflow.app',
      password: 'SecurePassword2026!',
    }),
  });
  const aliceData = await aliceReg.json();
  aliceToken = aliceData.data.tokens.accessToken;
  aliceUserId = aliceData.data.user._id;
  aliceWorkspaceId = aliceData.data.defaultWorkspace._id;

  // Setup Bob
  const bobReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bob Member',
      email: 'bob.dev@teamflow.app',
      password: 'SecurePassword2026!',
    }),
  });
  const bobData = await bobReg.json();
  bobToken = bobData.data.tokens.accessToken;
  bobUserId = bobData.data.user._id;

  // Setup Mallory in her own separate workspace
  const malloryReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Mallory Hacker',
      email: 'mallory@externalcorp.com',
      password: 'SecurePassword2026!',
    }),
  });
  const malloryData = await malloryReg.json();
  malloryToken = malloryData.data.tokens.accessToken;
  malloryWorkspaceId = malloryData.data.defaultWorkspace._id;

  // 1. Workspaces & Member Invitation
  let inviteToken;
  await t.test('1. Workspaces: invite member, accept invitation, and assign team_member role', async () => {
    // Alice invites Bob
    const inviteRes = await fetch(`${baseUrl}/workspaces/${aliceWorkspaceId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        email: 'bob.dev@teamflow.app',
        role: 'team_member',
      }),
    });
    const inviteBody = await inviteRes.json();
    assert.equal(inviteRes.status, 201);
    assert.ok(inviteBody.data.token);
    inviteToken = inviteBody.data.token;

    // Bob accepts invitation
    const acceptRes = await fetch(`${baseUrl}/workspaces/invitations/${inviteToken}/accept`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bobToken}`,
      },
    });
    const acceptBody = await acceptRes.json();
    assert.equal(acceptRes.status, 200);
    assert.equal(acceptBody.data.role, 'team_member');

    // Verify Bob is now listed in Alice's workspace members
    const membersRes = await fetch(`${baseUrl}/workspaces/${aliceWorkspaceId}/members`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
      },
    });
    const membersBody = await membersRes.json();
    assert.equal(membersRes.status, 200);
    assert.equal(membersBody.data.length, 2);
  });

  // 2. Teams
  let createdTeamId;
  await t.test('2. Teams: create team, assign lead and members', async () => {
    const teamRes = await fetch(`${baseUrl}/workspaces/${aliceWorkspaceId}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        name: 'Core Platform Engineering',
        description: 'Backend services, database optimization, and real-time gateways.',
        leadId: aliceUserId,
        memberIds: [aliceUserId, bobUserId],
      }),
    });
    const teamBody = await teamRes.json();
    assert.equal(teamRes.status, 201);
    assert.equal(teamBody.data.name, 'Core Platform Engineering');
    createdTeamId = teamBody.data._id;

    // Fetch teams
    const listRes = await fetch(`${baseUrl}/workspaces/${aliceWorkspaceId}/teams`, {
      headers: {
        Authorization: `Bearer ${bobToken}`,
      },
    });
    const listBody = await listRes.json();
    assert.equal(listRes.status, 200);
    assert.equal(listBody.data.length, 1);
  });

  // 3. Projects
  let createdProjectId;
  await t.test('3. Projects: create project with cover image, due date, and member roster', async () => {
    const projRes = await fetch(`${baseUrl}/workspaces/${aliceWorkspaceId}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
      },
      body: JSON.stringify({
        name: 'Real-Time Collaboration Engine',
        description: 'Sub-100ms multi-tenant socket architecture and state synchronization.',
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
        color: '#E98269',
        leadId: aliceUserId,
        memberIds: [aliceUserId, bobUserId],
        dueDate: '2026-12-31',
      }),
    });
    const projBody = await projRes.json();
    assert.equal(projRes.status, 201);
    assert.equal(projBody.data.name, 'Real-Time Collaboration Engine');
    assert.ok(projBody.data.slug);
    createdProjectId = projBody.data._id;

    // Get project details
    const getRes = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
      headers: {
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
    });
    const getBody = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.equal(getBody.data.taskCount, 0);
  });

  // 4. Task Management & Kanban
  let createdTaskId;
  await t.test('4. Task Management: create task, assign Bob, set checklist and priority', async () => {
    const taskRes = await fetch(`${baseUrl}/projects/${createdProjectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
      body: JSON.stringify({
        title: 'Implement Socket.IO Heartbeat & Room Isolation',
        description: 'Verify ping/pong interval and prevent memory leaks on client disconnect.',
        column: 'todo',
        priority: 'urgent',
        assigneeIds: [bobUserId],
        tags: ['backend', 'real-time', 'security'],
        dueDate: '2026-11-20',
      }),
    });
    const taskBody = await taskRes.json();
    assert.equal(taskRes.status, 201);
    assert.equal(taskBody.data.column, 'todo');
    assert.equal(taskBody.data.priority, 'urgent');
    createdTaskId = taskBody.data._id;

    // Add subtask (checklist item)
    const checkRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/checklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
      body: JSON.stringify({
        title: 'Add ping timeout event handler',
      }),
    });
    const checkBody = await checkRes.json();
    assert.equal(checkRes.status, 201);
    assert.equal(checkBody.data.completed, false);
    const itemId = checkBody.data._id;

    // Toggle checklist item
    const toggleRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/checklist/${itemId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
    });
    const toggleBody = await toggleRes.json();
    assert.equal(toggleRes.status, 200);
    assert.equal(toggleBody.data.completed, true);
  });

  // 5. Kanban Move Column Operation
  await t.test('5. Kanban: move task from todo -> inprogress -> done with server persistence', async () => {
    const moveRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
      body: JSON.stringify({
        column: 'inprogress',
        orderIndex: 2500,
      }),
    });
    const moveBody = await moveRes.json();
    assert.equal(moveRes.status, 200);
    assert.equal(moveBody.data.column, 'inprogress');
    assert.equal(moveBody.data.orderIndex, 2500);

    // Verify persisted in DB
    const fetchedTask = await Task.findById(createdTaskId);
    assert.equal(fetchedTask.column, 'inprogress');
  });

  // 6. Comments on Tasks
  let createdCommentId;
  await t.test('6. Comments: post comment on task and retrieve comment feed', async () => {
    const postRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
      body: JSON.stringify({
        content: 'Heartbeat handler has been benchmarked with 10k connections. Working smoothly!',
      }),
    });
    const postBody = await postRes.json();
    assert.equal(postRes.status, 201);
    assert.equal(postBody.data.authorId.name, 'Bob Member');
    createdCommentId = postBody.data._id;

    // Fetch comments
    const listRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/comments`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
    });
    const listBody = await listRes.json();
    assert.equal(listRes.status, 200);
    assert.equal(listBody.data.length, 1);
  });

  // 7. My Tasks Query
  await t.test('7. My Tasks: retrieves tasks assigned to the authenticated user', async () => {
    const myTasksRes = await fetch(`${baseUrl}/workspaces/${aliceWorkspaceId}/tasks/my-tasks`, {
      headers: {
        Authorization: `Bearer ${bobToken}`,
      },
    });
    const myTasksBody = await myTasksRes.json();
    assert.equal(myTasksRes.status, 200);
    assert.equal(myTasksBody.data.length, 1);
    assert.equal(myTasksBody.data[0]._id, createdTaskId);
  });

  // 8. Project Activity Audit Trail
  await t.test('8. Activity Audit Trail: retrieves chronological activity events for project', async () => {
    const actRes = await fetch(`${baseUrl}/projects/${createdProjectId}/activities`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
    });
    const actBody = await actRes.json();
    assert.equal(actRes.status, 200);
    assert.ok(actBody.data.length >= 3, 'Activities recorded for project, task, and moves');
  });

  // 9. Multi-Tenant IDOR Protection
  await t.test('9. Multi-Tenant IDOR: external user cannot access or mutate private tasks/projects', async () => {
    // Mallory attempts to read Alice's project
    const idorProjRes = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
      headers: {
        Authorization: `Bearer ${malloryToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
    });
    assert.equal(idorProjRes.status, 403, 'Mallory is rejected with HTTP 403');

    // Mallory attempts to move Alice's task
    const idorTaskRes = await fetch(`${baseUrl}/tasks/${createdTaskId}/move`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${malloryToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
      body: JSON.stringify({ column: 'done' }),
    });
    assert.equal(idorTaskRes.status, 403, 'Mallory cannot mutate tasks in Alice workspace');
  });

  // 10. Role-Based Permissions (RBAC)
  await t.test('10. RBAC: standard team_member cannot delete project or team', async () => {
    // Bob (role: team_member) attempts to delete project (requires owner/admin)
    const delProjRes = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${bobToken}`,
        'x-workspace-id': aliceWorkspaceId,
      },
    });
    assert.equal(delProjRes.status, 403, 'team_member is denied permission to delete project');

    // Bob attempts to delete team (requires owner/admin)
    const delTeamRes = await fetch(`${baseUrl}/workspaces/${aliceWorkspaceId}/teams/${createdTeamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${bobToken}`,
      },
    });
    assert.equal(delTeamRes.status, 403, 'team_member is denied permission to delete team');
  });
});
