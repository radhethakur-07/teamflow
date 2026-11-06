import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { hashToken } from '../utils/jwt.js';

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
  baseUrl = `http://127.0.0.1:${port}/api/v1/auth`;
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  await new Promise((resolve) => server.close(resolve));
});

test('Production Authentication Suite: Email verification, Brevo OTP, Token Rotation, Reuse Detection, Password Reset', async (t) => {
  const testUser = {
    name: 'Sarah Connor',
    email: 'sarah@teamflow.app',
    password: 'CyberPassword2026!',
  };

  let accessToken;
  let rawRefreshTokenCookie;
  let devVerificationOtp;

  // 1. Register User with Auto-provisioning and Brevo verification OTP
  await t.test('1. Register user: generates verification OTP and sets HttpOnly refresh cookie', async () => {
    const res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const body = await res.json();
    assert.equal(res.status, 201);
    assert.equal(body.success, true);
    assert.ok(body.data.tokens.accessToken, 'Access token is returned');
    assert.equal(body.data.tokens.refreshToken, undefined, 'Refresh token must NOT be exposed in JSON response');
    assert.equal(body.data.emailVerificationRequired, true);
    assert.equal(body.data.user.isEmailVerified, false);

    // Save tokens and cookies
    accessToken = body.data.tokens.accessToken;
    devVerificationOtp = body.data.devVerificationOtp;

    // Check Set-Cookie header for teamflow_refresh_token
    const setCookieHeader = res.headers.get('set-cookie');
    assert.ok(setCookieHeader, 'Set-Cookie header should be present');
    assert.match(setCookieHeader, /teamflow_refresh_token=/, 'Cookie name is teamflow_refresh_token');
    assert.match(setCookieHeader, /HttpOnly/i, 'Cookie must have HttpOnly flag');

    // Extract cookie value
    rawRefreshTokenCookie = setCookieHeader.split(';')[0];
  });

  // 2. Email verification using the 6-digit OTP
  await t.test('2. Verify email address using the 6-digit OTP', async () => {
    assert.ok(devVerificationOtp, 'Dev verification OTP should be generated');

    const res = await fetch(`${baseUrl}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        otp: devVerificationOtp,
      }),
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.isEmailVerified, true);

    const updatedUser = await User.findOne({ email: testUser.email });
    assert.equal(updatedUser.isEmailVerified, true);
  });

  // 3. User Login: returns access token and rotates HttpOnly refresh cookie
  await t.test('3. Login with password: sets HttpOnly cookie and validates credentials', async () => {
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.ok(body.data.tokens.accessToken);
    accessToken = body.data.tokens.accessToken;

    const setCookieHeader = res.headers.get('set-cookie');
    assert.ok(setCookieHeader);
    rawRefreshTokenCookie = setCookieHeader.split(';')[0];
  });

  // 4. Authenticated Profile Inspection (GET /me)
  await t.test('4. Retrieve authenticated profile (GET /me)', async () => {
    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.data.user.email, testUser.email);
    assert.equal(body.data.workspaces.length, 1);
  });

  // 5. Refresh Token Rotation (Cookie-based)
  let rotatedCookie;
  let originalRawToken;

  await t.test('5. Refresh Token Rotation: issues new access token & rotates refresh cookie', async () => {
    // Save original refresh token string to test reuse detection later
    originalRawToken = rawRefreshTokenCookie.replace('teamflow_refresh_token=', '');

    const res = await fetch(`${baseUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: rawRefreshTokenCookie,
      },
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(body.data.tokens.accessToken);

    const setCookieHeader = res.headers.get('set-cookie');
    assert.ok(setCookieHeader);
    rotatedCookie = setCookieHeader.split(';')[0];

    // Check that DB marked original token as revoked
    const originalHash = hashToken(originalRawToken);
    const originalDoc = await RefreshToken.findOne({ tokenHash: originalHash });
    assert.equal(originalDoc.isRevoked, true, 'Original refresh token is revoked after rotation');
  });

  // 6. Token Reuse Detection
  await t.test('6. Token Reuse Detection: reusing a revoked token revokes all session family tokens', async () => {
    // Attempt to use the already-used original refresh token
    const res = await fetch(`${baseUrl}/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: `teamflow_refresh_token=${originalRawToken}`,
      },
    });

    const body = await res.json();
    assert.equal(res.status, 403, 'Reused refresh token returns HTTP 403 Forbidden');
    assert.equal(body.error.code, 'REFRESH_TOKEN_REUSE_DETECTED');

    // Confirm that the entire family was invalidated
    const rotatedRawToken = rotatedCookie.replace('teamflow_refresh_token=', '');
    const rotatedDoc = await RefreshToken.findOne({ tokenHash: hashToken(rotatedRawToken) });
    assert.equal(rotatedDoc.isRevoked, true, 'Subsequent tokens in the family are also revoked for safety');
  });

  // 7. Forgot Password & Reset Password Workflow with OTP
  await t.test('7. Password Recovery: sends OTP and resets password with session revocation', async () => {
    // Request forgot password
    const forgotRes = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email }),
    });

    const forgotBody = await forgotRes.json();
    assert.equal(forgotRes.status, 200);
    assert.equal(forgotBody.success, true);
    assert.ok(forgotBody.data.devOtp, 'Development OTP returned in simulation mode');

    const resetOtp = forgotBody.data.devOtp;
    const newPassword = 'BrandNewPassword2026!';

    // Reset password with OTP
    const resetRes = await fetch(`${baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        otp: resetOtp,
        newPassword,
      }),
    });

    const resetBody = await resetRes.json();
    assert.equal(resetRes.status, 200);
    assert.equal(resetBody.success, true);

    // Verify old password fails
    const oldLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });
    assert.equal(oldLoginRes.status, 401);

    // Verify new password succeeds
    const newLoginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: newPassword,
      }),
    });
    assert.equal(newLoginRes.status, 200);
  });

  // 8. Logout revokes active refresh token and clears cookie
  await t.test('8. Logout: revokes refresh token and clears HttpOnly cookie', async () => {
    // Login to get fresh cookie
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'BrandNewPassword2026!',
      }),
    });

    const cookieHeader = loginRes.headers.get('set-cookie');
    const cookie = cookieHeader.split(';')[0];
    const rawToken = cookie.replace('teamflow_refresh_token=', '');

    // Logout
    const logoutRes = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
      },
    });

    assert.equal(logoutRes.status, 200);
    const clearCookieHeader = logoutRes.headers.get('set-cookie');
    assert.ok(clearCookieHeader);
    // Should set max-age=0 or expires in past
    assert.match(clearCookieHeader, /(Max-Age=0|expires=)/i);

    const tokenDoc = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
    assert.equal(tokenDoc.isRevoked, true);
  });
});
