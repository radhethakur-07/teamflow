import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { io as ClientIO } from 'socket.io-client';
import { Server } from 'socket.io';
import app from '../app.js';
import { initSocketServer } from '../sockets/index.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { generateTokens } from '../utils/jwt.js';
import { hashPassword } from '../utils/password.js';
import * as taskService from '../services/task.service.js';

let mongod;
let httpServer;
let ioServer;
let serverPort;
let baseUrl;

// Test actors
let alice, bob, mallory;
let aliceToken, bobToken, malloryToken;
let workspace, project;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  httpServer = http.createServer(app);
  ioServer = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket'],
  });

  initSocketServer(ioServer);
  app.set('io', ioServer);

  await new Promise((resolve) => httpServer.listen(0, resolve));
  serverPort = httpServer.address().port;
  baseUrl = `http://127.0.0.1:${serverPort}`;

  const pwHash = await hashPassword('Password123!');

  // Seed Users
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

  // Seed Workspace: Alice is owner, Bob is member
  workspace = await Workspace.create({
    name: 'Acme SaaS',
    slug: 'acme-saas',
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

  // Seed Project
  project = await Project.create({
    workspaceId: workspace._id,
    name: 'Mobile App Redesign',
    slug: 'mobile-app-redesign',
    ownerId: alice._id,
    memberIds: [alice._id, bob._id],
    isPrivate: true,
  });
});

test.after(async () => {
  if (ioServer) {
    await new Promise((resolve) => ioServer.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
});

test('Milestone 6 Real-Time Suite: Socket Auth, Presence, Security, Chat, Tasks & Notifications', async (t) => {
  // Helper to connect a test client
  const createClient = (token, transports = ['websocket']) => {
    return ClientIO(baseUrl, {
      auth: { token },
      transports,
      forceNew: true,
      reconnection: false,
    });
  };

  await t.test('1. Socket Authentication: rejects unauthenticated connections', async () => {
    await new Promise((resolve) => {
      const socket = ClientIO(baseUrl, {
        auth: {}, // No token
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect_error', (err) => {
        assert.ok(err.message.includes('AUTHENTICATION_REQUIRED'));
        socket.disconnect();
        resolve();
      });
    });
  });

  await t.test('2. Socket Authentication: rejects invalid or forged JWT tokens', async () => {
    await new Promise((resolve) => {
      const socket = ClientIO(baseUrl, {
        auth: { token: 'invalid.forged.jwt.token' },
        transports: ['websocket'],
        reconnection: false,
      });

      socket.on('connect_error', (err) => {
        assert.ok(err.message.includes('INVALID_TOKEN'));
        socket.disconnect();
        resolve();
      });
    });
  });

  await t.test('3. Socket Authentication: successfully connects verified user', async () => {
    await new Promise((resolve) => {
      const socket = createClient(aliceToken);

      socket.on('socket:connected', (data) => {
        assert.equal(data.userId, alice._id.toString());
        assert.equal(data.name, 'Alice Cooper');
        socket.disconnect();
        resolve();
      });
    });
  });

  await t.test('4. Security: Mallory blocked from joining Alice private workspace and project rooms', async () => {
    const mallorySocket = createClient(malloryToken);
    await new Promise((resolve) => mallorySocket.on('socket:connected', resolve));

    // Attempt 1: Mallory tries to join Alice's workspace
    const wsResult = await new Promise((resolve) => {
      mallorySocket.emit('room:join', { room: `workspace:${workspace._id}` }, (response) => {
        resolve(response);
      });
    });
    assert.equal(wsResult.success, false);
    assert.ok(wsResult.error.includes('not an active member'));

    // Attempt 2: Mallory tries to join Alice's private project room
    const prjResult = await new Promise((resolve) => {
      mallorySocket.emit('room:join', { room: `project:${project._id}` }, (response) => {
        resolve(response);
      });
    });
    assert.equal(prjResult.success, false);
    assert.ok(prjResult.error.includes('do not belong to the workspace'));

    mallorySocket.disconnect();
  });

  await t.test('5. Room Joining: Alice and Bob successfully join workspace and project rooms', async () => {
    const aliceSocket = createClient(aliceToken);
    const bobSocket = createClient(bobToken);

    await Promise.all([
      new Promise((res) => aliceSocket.on('socket:connected', res)),
      new Promise((res) => bobSocket.on('socket:connected', res)),
    ]);

    const aliceWsRes = await new Promise((res) => {
      aliceSocket.emit('room:join', { room: `workspace:${workspace._id}` }, res);
    });
    assert.equal(aliceWsRes.success, true);
    assert.equal(aliceWsRes.room, `workspace:${workspace._id}`);

    const bobPrjRes = await new Promise((res) => {
      bobSocket.emit('room:join', { room: `project:${project._id}` }, res);
    });
    assert.equal(bobPrjRes.success, true);
    assert.equal(bobPrjRes.room, `project:${project._id}`);

    aliceSocket.disconnect();
    bobSocket.disconnect();
  });

  await t.test('6. Real-Time Direct Messaging: Alice sends message to Bob with persistence', async () => {
    const aliceSocket = createClient(aliceToken);
    const bobSocket = createClient(bobToken);

    await Promise.all([
      new Promise((res) => aliceSocket.on('socket:connected', res)),
      new Promise((res) => bobSocket.on('socket:connected', res)),
    ]);

    // Bob listens for direct message
    const messagePromise = new Promise((resolve) => {
      bobSocket.on('message:received', (data) => {
        resolve(data);
      });
    });

    // Alice sends direct message to Bob
    const sendResult = await new Promise((resolve) => {
      aliceSocket.emit(
        'message:send',
        {
          workspaceId: workspace._id.toString(),
          recipientId: bob._id.toString(),
          content: 'Hey Bob, is the sprint on track?',
          clientTempId: 'client-12345',
        },
        resolve
      );
    });

    assert.equal(sendResult.success, true);
    assert.equal(sendResult.message.content, 'Hey Bob, is the sprint on track?');
    assert.equal(sendResult.message.clientTempId, 'client-12345');

    const received = await messagePromise;
    assert.equal(received.message.content, 'Hey Bob, is the sprint on track?');
    assert.equal(received.message.senderId._id.toString(), alice._id.toString());

    // Verify persisted in MongoDB
    const dbMsg = await Message.findById(received.message._id);
    assert.ok(dbMsg);
    assert.equal(dbMsg.content, 'Hey Bob, is the sprint on track?');

    aliceSocket.disconnect();
    bobSocket.disconnect();
  });

  await t.test('7. Real-Time Project Chat: Room broadcast, typing indicator, and read receipts', async () => {
    const aliceSocket = createClient(aliceToken);
    const bobSocket = createClient(bobToken);

    await Promise.all([
      new Promise((res) => aliceSocket.on('socket:connected', res)),
      new Promise((res) => bobSocket.on('socket:connected', res)),
    ]);

    // Both join project room
    await Promise.all([
      new Promise((res) => aliceSocket.emit('room:join', { room: `project:${project._id}` }, res)),
      new Promise((res) => bobSocket.emit('room:join', { room: `project:${project._id}` }, res)),
    ]);

    // Test Typing Indicator
    const typingPromise = new Promise((resolve) => {
      bobSocket.on('typing:update', (data) => {
        resolve(data);
      });
    });

    aliceSocket.emit('typing:start', { room: `project:${project._id}` });
    const typingData = await typingPromise;
    assert.equal(typingData.userId, alice._id.toString());
    assert.equal(typingData.isTyping, true);

    // Test Message Broadcast in Project Room
    const projectMsgPromise = new Promise((resolve) => {
      bobSocket.on('message:received', resolve);
    });

    aliceSocket.emit('message:send', {
      workspaceId: workspace._id.toString(),
      channelId: project._id.toString(),
      content: 'Project standup starts in 5 minutes.',
    });

    const projectMsg = await projectMsgPromise;
    assert.equal(projectMsg.message.content, 'Project standup starts in 5 minutes.');

    // Test Read Receipt
    const receiptPromise = new Promise((resolve) => {
      aliceSocket.on('message:read_receipt', resolve);
    });

    bobSocket.emit('message:read', {
      messageIds: [projectMsg.message._id],
      room: `project:${project._id}`,
    });

    const receipt = await receiptPromise;
    assert.equal(receipt.readerId, bob._id.toString());
    assert.ok(receipt.messageIds.includes(projectMsg.message._id.toString()));

    // Verify readBy in MongoDB
    const updatedDbMsg = await Message.findById(projectMsg.message._id);
    assert.ok(updatedDbMsg.readBy.some((id) => id.toString() === bob._id.toString()));

    aliceSocket.disconnect();
    bobSocket.disconnect();
  });

  await t.test('8. Multi-Tab Presence: Online/offline tracking across multiple tabs', async () => {
    // Bob is watching workspace
    const bobSocket = createClient(bobToken);
    await new Promise((res) => bobSocket.on('socket:connected', res));
    await new Promise((res) => bobSocket.emit('room:join', { room: `workspace:${workspace._id}` }, res));

    let aliceOnlineCount = 0;
    let aliceOfflineCount = 0;

    bobSocket.on('presence:update', (data) => {
      if (data.userId === alice._id.toString()) {
        if (data.status === 'online') aliceOnlineCount++;
        if (data.status === 'offline') aliceOfflineCount++;
      }
    });

    // Alice opens Tab 1
    const aliceTab1 = createClient(aliceToken);
    await new Promise((res) => aliceTab1.on('socket:connected', res));
    await new Promise((res) => setTimeout(res, 50));
    assert.equal(aliceOnlineCount, 1, 'First tab triggers online status');

    // Alice opens Tab 2 (should NOT send duplicate online event)
    const aliceTab2 = createClient(aliceToken);
    await new Promise((res) => aliceTab2.on('socket:connected', res));
    await new Promise((res) => setTimeout(res, 50));
    assert.equal(aliceOnlineCount, 1, 'Second tab does not re-emit online');

    // Alice closes Tab 1 (still has Tab 2, so should NOT send offline event)
    aliceTab1.disconnect();
    await new Promise((res) => setTimeout(res, 50));
    assert.equal(aliceOfflineCount, 0, 'Closing one tab does not trigger offline');

    // Alice closes Tab 2 (all tabs closed -> triggers offline)
    aliceTab2.disconnect();
    await new Promise((res) => setTimeout(res, 50));
    assert.equal(aliceOfflineCount, 1, 'Closing last tab triggers offline status');

    bobSocket.disconnect();
  });

  await t.test('9. Real-Time Task Synchronization: Moving task emits event to project room', async () => {
    const task = await Task.create({
      workspaceId: workspace._id,
      projectId: project._id,
      creatorId: alice._id,
      title: 'Real-time sync test task',
      column: 'todo',
      priority: 'high',
    });

    const bobSocket = createClient(bobToken);
    await new Promise((res) => bobSocket.on('socket:connected', res));
    await new Promise((res) => bobSocket.emit('room:join', { room: `project:${project._id}` }, res));

    const taskMovedPromise = new Promise((resolve) => {
      bobSocket.on('task:moved', (data) => {
        resolve(data);
      });
    });

    // Alice moves task via taskService
    await taskService.moveTask(task._id, workspace._id, 'inprogress', 2000, alice._id);

    const eventData = await taskMovedPromise;
    assert.equal(eventData.eventType, 'task:moved');
    assert.equal(eventData.task.column, 'inprogress');
    assert.equal(eventData.projectId, project._id.toString());

    bobSocket.disconnect();
  });

  await t.test('10. Real-Time Notifications: Task assignment triggers notification to user personal room', async () => {
    const bobSocket = createClient(bobToken);
    await new Promise((res) => bobSocket.on('socket:connected', res));

    const notifPromise = new Promise((resolve) => {
      bobSocket.on('notification:new', (notif) => {
        resolve(notif);
      });
    });

    // Alice creates task assigned to Bob
    await taskService.createTask(
      project._id,
      {
        title: 'Review pull request for Realtime WebSockets',
        column: 'todo',
        priority: 'urgent',
        assigneeIds: [bob._id],
      },
      alice._id,
      workspace._id
    );

    const receivedNotif = await notifPromise;
    assert.equal(receivedNotif.userId.toString(), bob._id.toString());
    assert.equal(receivedNotif.type, 'ASSIGNED');
    assert.ok(receivedNotif.title.includes('New Task Assigned'));

    bobSocket.disconnect();
  });

  await t.test('11. Message Validation: Content cannot be empty or excessively long', async () => {
    const aliceSocket = createClient(aliceToken);
    await new Promise((res) => aliceSocket.on('socket:connected', res));

    // Empty content rejected
    const emptyRes = await new Promise((resolve) => {
      aliceSocket.emit(
        'message:send',
        {
          workspaceId: workspace._id.toString(),
          recipientId: bob._id.toString(),
          content: '   ',
        },
        resolve
      );
    });
    assert.ok(emptyRes.error.includes('cannot be empty'));

    // Huge content rejected
    const hugeRes = await new Promise((resolve) => {
      aliceSocket.emit(
        'message:send',
        {
          workspaceId: workspace._id.toString(),
          recipientId: bob._id.toString(),
          content: 'A'.repeat(5001),
        },
        resolve
      );
    });
    assert.ok(hugeRes.error.includes('cannot exceed 5000'));

    aliceSocket.disconnect();
  });
});
