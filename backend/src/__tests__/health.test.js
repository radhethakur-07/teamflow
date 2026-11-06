import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app.js';

test('GET /api/health returns 200 and healthy status envelope', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/api/health`;

  try {
    const response = await fetch(url);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'healthy');
    assert.equal(body.data.services.api, 'operational');
    assert.ok(body.data.timestamp);
    assert.ok(body.data.version);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/health/ready reports database readiness status', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/api/health/ready`;

  try {
    const response = await fetch(url);
    const body = await response.json();
    // In disconnected state, ready probe returns 503; in connected, 200
    assert.ok(response.status === 200 || response.status === 503);
    assert.ok(body.data.status);
    assert.ok(body.data.database);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /non-existent-route returns 404 with standardized error envelope', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/api/v1/unknown-endpoint`;

  try {
    const response = await fetch(url);
    assert.equal(response.status, 404);

    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
