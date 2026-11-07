import crypto from 'crypto';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateTokens,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt.js';
import { config } from '../config/env.js';
import {
  generateNumericOtp,
  sendVerificationEmail,
  sendLoginOtpEmail,
  sendPasswordResetEmail,
} from './email.service.js';

/**
 * Registers a new user, initiates workspace provisioning, and dispatches verification OTP
 */
export const registerUser = async ({
  name,
  email,
  password,
  userAgent = '',
  ipAddress = '',
}) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const passwordHash = await hashPassword(password);

  // Generate 6-digit email verification OTP
  const verificationOtp = generateNumericOtp(6);
  const verificationOtpHash = hashToken(verificationOtp);
  const verificationExpires = new Date(
    Date.now() + config.auth.otpExpiryMinutes * 60 * 1000
  );

  const user = await User.create({
    name,
    email,
    passwordHash,
    isEmailVerified: false,
    emailVerificationOtpHash: verificationOtpHash,
    emailVerificationExpires: verificationExpires,
    emailVerificationAttempts: 0,
    emailVerificationLastSentAt: new Date(),
  });

  // Auto-provision initial personal workspace
  const baseSlug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30) || 'workspace';
  const uniqueSlug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

  const workspace = await Workspace.create({
    name: `${name}'s Workspace`,
    slug: uniqueSlug,
    ownerId: user._id,
    plan: 'starter',
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: user._id,
    role: 'workspace_owner',
    status: 'active',
  });

  user.defaultWorkspaceId = workspace._id;
  await user.save();

  // Send verification email via Brevo transactional email
  const emailResult = await sendVerificationEmail({
    email: user.email,
    name: user.name,
    otpCode: verificationOtp,
  });

  if (!emailResult.delivered && !config.isTest) {
    await User.deleteOne({ _id: user._id });
    await Workspace.deleteOne({ _id: workspace._id });
    await WorkspaceMember.deleteOne({ userId: user._id });
    const error = new Error(
      emailResult.error || 'Failed to dispatch verification email via Brevo. Please check your Brevo configuration.'
    );
    error.statusCode = 502;
    error.code = 'EMAIL_DELIVERY_FAILED';
    throw error;
  }

  // Issue initial token session
  const tokens = generateTokens(user);

  await RefreshToken.create({
    tokenHash: hashToken(tokens.refreshToken),
    userId: user._id,
    familyId: tokens.familyId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent,
    ipAddress,
  });

  return {
    user: user.toSafeJSON(),
    defaultWorkspace: workspace,
    tokens,
    emailVerificationRequired: true,
  };
};

/**
 * Validates the email verification OTP
 */
export const verifyEmail = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select(
    '+emailVerificationOtpHash +emailVerificationExpires +emailVerificationAttempts'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (user.isEmailVerified) {
    return {
      success: true,
      message: 'Email is already verified.',
      isEmailVerified: true,
    };
  }

  // 1. Check expiration
  if (
    !user.emailVerificationExpires ||
    new Date() > user.emailVerificationExpires
  ) {
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    error.code = 'OTP_EXPIRED';
    throw error;
  }

  // 2. Check maximum attempts (Max 5 attempts to protect against brute-force)
  const MAX_ATTEMPTS = 5;
  if ((user.emailVerificationAttempts || 0) >= MAX_ATTEMPTS) {
    user.emailVerificationOtpHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const error = new Error('Too many invalid attempts. This verification code has been invalidated. Please request a new code.');
    error.statusCode = 429;
    error.code = 'MAX_ATTEMPTS_EXCEEDED';
    throw error;
  }

  // 3. Compare hash
  const incomingHash = hashToken(otp);
  if (incomingHash !== user.emailVerificationOtpHash) {
    user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
    await user.save();

    const remainingAttempts = MAX_ATTEMPTS - user.emailVerificationAttempts;
    const error = new Error(
      `Invalid verification code. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Code invalidated.'}`
    );
    error.statusCode = 400;
    error.code = 'INVALID_OTP';
    throw error;
  }

  // 4. Mark verified & clear OTP to PREVENT REUSE
  user.isEmailVerified = true;
  user.emailVerificationOtpHash = undefined;
  user.emailVerificationExpires = undefined;
  user.emailVerificationAttempts = 0;
  await user.save();

  return {
    success: true,
    message: 'Email address verified successfully.',
    isEmailVerified: true,
  };
};

/**
 * Resends verification code to user's email with cooldown and Brevo delivery
 */
export const resendVerification = async ({ email }) => {
  const user = await User.findOne({ email }).select(
    '+emailVerificationOtpHash +emailVerificationExpires +emailVerificationAttempts +emailVerificationLastSentAt'
  );

  if (!user) {
    // Anti-enumeration: report generic success
    return {
      success: true,
      message: 'If this email is registered, a new verification code was dispatched.',
    };
  }

  if (user.isEmailVerified) {
    return {
      success: true,
      message: 'Email is already verified.',
      isEmailVerified: true,
    };
  }

  // Cooldown enforcement: 60 seconds minimum interval
  const COOLDOWN_SECONDS = 60;
  if (user.emailVerificationLastSentAt) {
    const elapsedSeconds =
      (Date.now() - new Date(user.emailVerificationLastSentAt).getTime()) / 1000;
    if (elapsedSeconds < COOLDOWN_SECONDS) {
      const remaining = Math.ceil(COOLDOWN_SECONDS - elapsedSeconds);
      const error = new Error(
        `Please wait ${remaining} seconds before requesting a new verification code.`
      );
      error.statusCode = 429;
      error.code = 'COOLDOWN_ACTIVE';
      error.retryAfter = remaining;
      throw error;
    }
  }

  const verificationOtp = generateNumericOtp(6);
  user.emailVerificationOtpHash = hashToken(verificationOtp);
  user.emailVerificationExpires = new Date(
    Date.now() + config.auth.otpExpiryMinutes * 60 * 1000
  );
  user.emailVerificationAttempts = 0;
  user.emailVerificationLastSentAt = new Date();
  await user.save();

  const emailResult = await sendVerificationEmail({
    email: user.email,
    name: user.name,
    otpCode: verificationOtp,
  });

  if (!emailResult.delivered && !config.isTest) {
    const error = new Error(
      emailResult.error || 'Failed to dispatch verification email via Brevo. Please check your Brevo configuration.'
    );
    error.statusCode = 502;
    error.code = 'EMAIL_DELIVERY_FAILED';
    throw error;
  }

  return {
    success: true,
    message: 'Verification code resent successfully.',
  };
};

/**
 * Authenticates user credentials with support for Brevo OTP challenge
 */
export const loginUser = async ({
  email,
  password,
  otp,
  userAgent = '',
  ipAddress = '',
  requireOtp = false,
}) => {
  const user = await User.findOne({ email }).select(
    '+passwordHash +loginOtpHash +loginOtpExpires'
  );

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error('Account is suspended or deactivated.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_INACTIVE';
    throw error;
  }

  // Check if 2FA is required or requested
  if (user.twoFactorEnabled || requireOtp) {
    if (!otp) {
      // Step 1: Generate & dispatch login OTP
      const loginOtp = generateNumericOtp(6);
      user.loginOtpHash = hashToken(loginOtp);
      user.loginOtpExpires = new Date(
        Date.now() + config.auth.otpExpiryMinutes * 60 * 1000
      );
      await user.save();

      await sendLoginOtpEmail({
        email: user.email,
        name: user.name,
        otpCode: loginOtp,
      });

      return {
        requireOtp: true,
        email: user.email,
        message: 'A 6-digit verification code has been sent to your email address.',
      };
    }

    // Step 2: Validate submitted OTP
    if (!user.loginOtpExpires || new Date() > user.loginOtpExpires) {
      const error = new Error('Login verification code has expired.');
      error.statusCode = 400;
      error.code = 'OTP_EXPIRED';
      throw error;
    }

    if (hashToken(otp) !== user.loginOtpHash) {
      const error = new Error('Invalid login verification code.');
      error.statusCode = 400;
      error.code = 'INVALID_OTP';
      throw error;
    }

    // Clear used login OTP
    user.loginOtpHash = undefined;
    user.loginOtpExpires = undefined;
  }

  user.lastLoginAt = new Date();
  await user.save();

  // Issue new token family lineage
  const tokens = generateTokens(user);

  await RefreshToken.create({
    tokenHash: hashToken(tokens.refreshToken),
    userId: user._id,
    familyId: tokens.familyId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent,
    ipAddress,
  });

  // Query and hydrate user's workspaces and default workspace to prevent dashboard blank screen race conditions
  const workspaceMemberships = await WorkspaceMember.find({ userId: user._id })
    .populate('workspaceId')
    .lean();

  const workspaces = workspaceMemberships
    .map((wm) => {
      const ws = wm.workspaceId;
      if (!ws || !ws._id) return null;
      return {
        ...ws,
        id: ws._id.toString(),
        memberRole: wm.role,
      };
    })
    .filter(Boolean);

  const defaultWorkspace =
    workspaces.find((w) => w._id?.toString() === user.defaultWorkspaceId?.toString()) ||
    workspaces[0] ||
    null;

  return {
    user: user.toSafeJSON(),
    workspaces,
    defaultWorkspace,
    tokens,
  };
};

/**
 * Validates Login OTP independently (passwordless or 2nd step)
 */
export const verifyLoginOtp = async ({
  email,
  otp,
  userAgent = '',
  ipAddress = '',
}) => {
  const user = await User.findOne({ email }).select(
    '+loginOtpHash +loginOtpExpires'
  );

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (!user.loginOtpExpires || new Date() > user.loginOtpExpires) {
    const error = new Error('Login verification code has expired.');
    error.statusCode = 400;
    error.code = 'OTP_EXPIRED';
    throw error;
  }

  if (hashToken(otp) !== user.loginOtpHash) {
    const error = new Error('Invalid login verification code.');
    error.statusCode = 400;
    error.code = 'INVALID_OTP';
    throw error;
  }

  user.loginOtpHash = undefined;
  user.loginOtpExpires = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const tokens = generateTokens(user);

  await RefreshToken.create({
    tokenHash: hashToken(tokens.refreshToken),
    userId: user._id,
    familyId: tokens.familyId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent,
    ipAddress,
  });

  const workspaceMemberships = await WorkspaceMember.find({ userId: user._id })
    .populate('workspaceId')
    .lean();

  const workspaces = workspaceMemberships
    .map((wm) => {
      const ws = wm.workspaceId;
      if (!ws || !ws._id) return null;
      return {
        ...ws,
        id: ws._id.toString(),
        memberRole: wm.role,
      };
    })
    .filter(Boolean);

  const defaultWorkspace =
    workspaces.find((w) => w._id?.toString() === user.defaultWorkspaceId?.toString()) ||
    workspaces[0] ||
    null;

  return {
    user: user.toSafeJSON(),
    workspaces,
    defaultWorkspace,
    tokens,
  };
};

/**
 * Refresh Token Rotation with Token Reuse Detection
 */
export const refreshTokens = async (
  rawRefreshToken,
  userAgent = '',
  ipAddress = ''
) => {
  if (!rawRefreshToken) {
    const error = new Error('Refresh token is required.');
    error.statusCode = 401;
    error.code = 'MISSING_REFRESH_TOKEN';
    throw error;
  }

  const payload = verifyRefreshToken(rawRefreshToken);
  if (!payload || !payload.userId) {
    const error = new Error('Invalid or expired refresh token signature.');
    error.statusCode = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  const incomingHash = hashToken(rawRefreshToken);
  const tokenDoc = await RefreshToken.findOne({ tokenHash: incomingHash });

  if (!tokenDoc) {
    const error = new Error('Refresh token session not found.');
    error.statusCode = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  // REUSE DETECTION: If token was already revoked/used, invalidate its entire family lineage!
  if (tokenDoc.isRevoked) {
    console.warn(
      `[SECURITY ALERT] Refresh token reuse detected for User ${tokenDoc.userId}, family ${tokenDoc.familyId}!`
    );
    // Revoke all tokens in this family lineage
    await RefreshToken.updateMany(
      { familyId: tokenDoc.familyId },
      { isRevoked: true }
    );

    const error = new Error(
      'Compromised session detected. All sessions in this chain have been revoked for your security.'
    );
    error.statusCode = 403;
    error.code = 'REFRESH_TOKEN_REUSE_DETECTED';
    throw error;
  }

  // Invalidate the current used refresh token
  tokenDoc.isRevoked = true;
  await tokenDoc.save();

  // Verify the user remains active
  const user = await User.findById(tokenDoc.userId);
  if (!user || user.status !== 'active') {
    const error = new Error('User not found or inactive.');
    error.statusCode = 401;
    error.code = 'USER_NOT_ACTIVE';
    throw error;
  }

  // Issue rotated token pair keeping the same family lineage
  const newTokens = generateTokens(user, tokenDoc.familyId);

  await RefreshToken.create({
    tokenHash: hashToken(newTokens.refreshToken),
    userId: user._id,
    familyId: tokenDoc.familyId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: userAgent || tokenDoc.userAgent,
    ipAddress: ipAddress || tokenDoc.ipAddress,
  });

  return {
    tokens: newTokens,
  };
};

/**
 * Revokes active refresh token and logs out current session
 */
export const logoutUser = async (rawRefreshToken) => {
  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { isRevoked: true });
  }
  return { success: true };
};

/**
 * Revokes all sessions for the user across all devices
 */
export const logoutAllSessions = async (userId) => {
  await RefreshToken.updateMany({ userId }, { isRevoked: true });
  return { success: true };
};

/**
 * Initiates single-use password reset workflow via Brevo OTP
 */
export const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email }).select(
    '+passwordResetOtpHash +passwordResetExpires'
  );

  // Anti-enumeration: return identical success message if user does not exist
  if (!user) {
    return {
      success: true,
      message:
        'If an account with that email exists, password reset instructions have been sent.',
    };
  }

  const resetOtp = generateNumericOtp(6);
  user.passwordResetOtpHash = hashToken(resetOtp);
  user.passwordResetExpires = new Date(
    Date.now() + config.auth.resetExpiryMinutes * 60 * 1000
  );
  await user.save();

  const emailResult = await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    otpCode: resetOtp,
  });

  if (!emailResult.delivered && !config.isTest) {
    const error = new Error(
      emailResult.error || 'Failed to dispatch password recovery email via Brevo. Please check your Brevo configuration.'
    );
    error.statusCode = 502;
    error.code = 'EMAIL_DELIVERY_FAILED';
    throw error;
  }

  return {
    success: true,
    message:
      'If an account with that email exists, password reset instructions have been sent.',
  };
};

/**
 * Resets user password using single-use OTP and revokes active sessions
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email }).select(
    '+passwordHash +passwordResetOtpHash +passwordResetExpires'
  );

  if (!user) {
    const error = new Error('Invalid or expired recovery code.');
    error.statusCode = 400;
    error.code = 'INVALID_OR_EXPIRED_OTP';
    throw error;
  }

  if (
    !user.passwordResetExpires ||
    new Date() > user.passwordResetExpires
  ) {
    const error = new Error('Password reset code has expired.');
    error.statusCode = 400;
    error.code = 'OTP_EXPIRED';
    throw error;
  }

  if (hashToken(otp) !== user.passwordResetOtpHash) {
    const error = new Error('Invalid recovery code.');
    error.statusCode = 400;
    error.code = 'INVALID_OTP';
    throw error;
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetOtpHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Invalidate all existing sessions upon password reset
  await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

  return {
    success: true,
    message: 'Your password has been successfully reset. Please log in with your new credentials.',
  };
};

/**
 * Retrieves current user profile with active workspace memberships
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const memberships = await WorkspaceMember.find({ userId, status: 'active' })
    .populate('workspaceId', 'name slug logoUrl plan')
    .lean();

  return {
    user: user.toSafeJSON(),
    workspaces: memberships.map((m) => ({
      workspace: m.workspaceId,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  };
};

/**
 * Updates current user profile information
 */
export const updateUserProfile = async (userId, updateData) => {
  const allowed = ['name', 'avatarUrl', 'jobTitle', 'bio', 'preferences'];
  const sanitized = {};
  for (const key of allowed) {
    if (updateData[key] !== undefined) sanitized[key] = updateData[key];
  }

  const user = await User.findByIdAndUpdate(userId, sanitized, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  return { user: user.toSafeJSON() };
};

/**
 * Updates authenticated user password
 */
export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    error.code = 'INVALID_CURRENT_PASSWORD';
    throw error;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  // Invalidate other sessions
  await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });

  return { success: true };
};
