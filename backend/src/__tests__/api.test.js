import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';

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

test('REST API Test Suite: Auth, Workspaces, Teams, Projects, Tasks & Multi-tenant Isolation', async (t) => {
  let authToken;
  let userId;
  let workspaceId;
  let teamId;
  let projectId;
  let taskId;

  // 1. Register User
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Cooper',
      email: 'alice@teamflow.app',
      password: 'SecurePassword123!',
    }),
  });
  const regBody = await regRes.json();
  assert.equal(regRes.status, 201);
  assert.equal(regBody.success, true);
  assert.ok(regBody.data.tokens.accessToken);
  assert.ok(regBody.data.defaultWorkspace);

  authToken = regBody.data.tokens.accessToken;
  userId = regBody.data.user._id;
  workspaceId = regBody.data.defaultWorkspace._id;

  // 2. Login User
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'alice@teamflow.app',
      password: 'SecurePassword123!',
    }),
  });
  const loginBody = await loginRes.json();
  assert.equal(loginRes.status, 200);
  assert.equal(loginBody.success, true);
  assert.ok(loginBody.data.tokens.accessToken);

  // 3. Get User Profile (/auth/me)
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const meBody = await meRes.json();
  assert.equal(meRes.status, 200);
  assert.equal(meBody.data.user.email, 'alice@teamflow.app');
  assert.equal(meBody.data.workspaces.length, 1);

  // 4. Create Workspace (/workspaces)
  const wsRes = await fetch(`${baseUrl}/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      name: 'Acme Product Labs',
      description: 'Design and engineering workspace',
    }),
  });
  const wsBody = await wsRes.json();
  assert.equal(wsRes.status, 201);
  assert.equal(wsBody.data.name, 'Acme Product Labs');
  const customWsId = wsBody.data._id;

  // 5. Get User Workspaces
  const listWsRes = await fetch(`${baseUrl}/workspaces`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const listWsBody = await listWsRes.json();
  assert.equal(listWsRes.status, 200);
  assert.ok(listWsBody.data.length >= 2);

  // 6. Create Team (/workspaces/:id/teams)
  const teamRes = await fetch(`${baseUrl}/workspaces/${customWsId}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      name: 'Core Design Team',
      description: 'UI/UX and design system squad',
    }),
  });
  const teamBody = await teamRes.json();
  assert.equal(teamRes.status, 201);
  assert.equal(teamBody.data.name, 'Core Design Team');
  teamId = teamBody.data._id;

  // 7. Create Project (/workspaces/:id/projects)
  const projRes = await fetch(`${baseUrl}/workspaces/${customWsId}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      name: 'Mobile App Redesign',
      description: 'Q4 mobile app overhaul',
      color: '#E98269',
      teamId,
    }),
  });
  const projBody = await projRes.json();
  assert.equal(projRes.status, 201);
  assert.equal(projBody.data.name, 'Mobile App Redesign');
  projectId = projBody.data._id;

  // 8. Create Task (/projects/:id/tasks)
  const taskRes = await fetch(`${baseUrl}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: 'Design Warm Editorial Theme Tokens',
      description: 'Implement Plus Jakarta Sans & DM Sans typography',
      priority: 'urgent',
      column: 'todo',
      tags: ['design', 'tokens'],
    }),
  });
  const taskBody = await taskRes.json();
  assert.equal(taskRes.status, 201);
  assert.equal(taskBody.data.title, 'Design Warm Editorial Theme Tokens');
  assert.equal(taskBody.data.priority, 'urgent');
  taskId = taskBody.data._id;

  // 9. Move Task (/tasks/:id/move)
  const moveRes = await fetch(`${baseUrl}/tasks/${taskId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      'x-workspace-id': customWsId,
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

  // 10. Add Checklist Item (/tasks/:id/checklist)
  const chkRes = await fetch(`${baseUrl}/tasks/${taskId}/checklist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
      'x-workspace-id': customWsId,
    },
    body: JSON.stringify({
      title: 'Verify 4.5:1 AA contrast ratio',
    }),
  });
  const chkBody = await chkRes.json();
  assert.equal(chkRes.status, 201);
  assert.equal(chkBody.data.title, 'Verify 4.5:1 AA contrast ratio');
  assert.equal(chkBody.data.completed, false);

  // 11. Security & Cross-Workspace Isolation Test:
  // Register a second user (Eve) who is NOT a member of customWsId
  const eveReg = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Eve Hacker',
      email: 'eve@external.com',
      password: 'SecurePassword123!',
    }),
  });
  const eveBody = await eveReg.json();
  const eveToken = eveBody.data.tokens.accessToken;

  // Eve attempts to access customWsId's projects -> MUST RETURN 403 Forbidden
  const unauthorizedProjRes = await fetch(`${baseUrl}/workspaces/${customWsId}/projects`, {
    headers: { Authorization: `Bearer ${eveToken}` },
  });
  assert.equal(unauthorizedProjRes.status, 403);
  const unauthorizedBody = await unauthorizedProjRes.json();
  assert.equal(unauthorizedBody.success, false);
  assert.equal(unauthorizedBody.error.code, 'FORBIDDEN_WORKSPACE_ACCESS');

  // Eve attempts to access Alice's task directly -> MUST RETURN 403 Forbidden
  const unauthorizedTaskRes = await fetch(`${baseUrl}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${eveToken}`,
      'x-workspace-id': customWsId,
    },
  });
  assert.equal(unauthorizedTaskRes.status, 403);
});
