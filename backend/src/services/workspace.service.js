import crypto from 'crypto';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Invitation } from '../models/Invitation.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { User } from '../models/User.js';

export const createWorkspace = async ({ name, description, slug }, userId) => {
  let uniqueSlug = slug;
  if (!uniqueSlug) {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
    uniqueSlug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  }

  const existing = await Workspace.findOne({ slug: uniqueSlug });
  if (existing) {
    const error = new Error('Workspace slug is already in use.');
    error.statusCode = 409;
    error.code = 'SLUG_ALREADY_EXISTS';
    throw error;
  }

  const workspace = await Workspace.create({
    name,
    description: description || '',
    slug: uniqueSlug,
    ownerId: userId,
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId,
    role: 'workspace_owner',
    status: 'active',
  });

  await ActivityLog.create({
    workspaceId: workspace._id,
    actorId: userId,
    action: 'WORKSPACE_CREATED',
    details: { name: workspace.name, slug: workspace.slug },
  });

  return workspace;
};

export const getUserWorkspaces = async (userId) => {
  const memberships = await WorkspaceMember.find({ userId, status: 'active' })
    .populate('workspaceId')
    .lean();

  return memberships
    .filter((m) => m.workspaceId && m.workspaceId.status === 'active')
    .map((m) => ({
      ...m.workspaceId,
      userRole: m.role,
      joinedAt: m.joinedAt,
    }));
};

export const getWorkspaceById = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace || workspace.status !== 'active') {
    const error = new Error('Workspace not found or archived.');
    error.statusCode = 404;
    error.code = 'WORKSPACE_NOT_FOUND';
    throw error;
  }

  const memberCount = await WorkspaceMember.countDocuments({ workspaceId, status: 'active' });
  return { ...workspace, memberCount };
};

export const updateWorkspace = async (workspaceId, updateData, userId) => {
  const workspace = await Workspace.findByIdAndUpdate(workspaceId, updateData, { new: true });
  return workspace;
};

export const inviteMember = async (workspaceId, email, role, inviterId) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const existingMember = await WorkspaceMember.findOne({
      workspaceId,
      userId: existingUser._id,
      status: 'active',
    });
    if (existingMember) {
      const error = new Error('User is already a member of this workspace.');
      error.statusCode = 409;
      error.code = 'MEMBER_ALREADY_EXISTS';
      throw error;
    }
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h expiry

  const invitation = await Invitation.create({
    workspaceId,
    email,
    role,
    token,
    invitedBy: inviterId,
    expiresAt,
  });

  return invitation;
};

export const acceptInvitation = async (token, userId) => {
  const invitation = await Invitation.findOne({ token, status: 'pending' });
  if (!invitation || invitation.expiresAt < new Date()) {
    const error = new Error('Invitation is invalid or has expired.');
    error.statusCode = 400;
    error.code = 'INVITATION_INVALID';
    throw error;
  }

  const user = await User.findById(userId);
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    const error = new Error('Invitation was issued for a different email address.');
    error.statusCode = 403;
    error.code = 'INVITATION_EMAIL_MISMATCH';
    throw error;
  }

  const member = await WorkspaceMember.findOneAndUpdate(
    { workspaceId: invitation.workspaceId, userId },
    { role: invitation.role, status: 'active', joinedAt: new Date() },
    { upsert: true, new: true }
  );

  invitation.status = 'accepted';
  await invitation.save();

  await ActivityLog.create({
    workspaceId: invitation.workspaceId,
    actorId: userId,
    action: 'MEMBER_JOINED',
    details: { role: invitation.role, email: invitation.email },
  });

  return member;
};

export const getWorkspaceMembers = async (workspaceId) => {
  const members = await WorkspaceMember.find({ workspaceId, status: 'active' })
    .populate('userId', 'name email avatarUrl status jobTitle')
    .sort({ role: 1, createdAt: 1 })
    .lean();

  return members.map((m) => ({
    _id: m._id,
    user: m.userId,
    role: m.role,
    status: m.status,
    joinedAt: m.joinedAt,
  }));
};

export const updateMemberRole = async (workspaceId, targetMemberId, newRole, actorId) => {
  const targetMember = await WorkspaceMember.findById(targetMemberId);
  if (!targetMember || targetMember.workspaceId.toString() !== workspaceId.toString()) {
    const error = new Error('Member not found in this workspace.');
    error.statusCode = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }

  // Prevent demoting the workspace owner
  if (targetMember.role === 'workspace_owner' && newRole !== 'workspace_owner') {
    const error = new Error('Cannot change role of the workspace owner without transferring ownership.');
    error.statusCode = 400;
    error.code = 'CANNOT_DEMOTE_OWNER';
    throw error;
  }

  targetMember.role = newRole;
  await targetMember.save();

  await ActivityLog.create({
    workspaceId,
    actorId,
    action: 'ROLE_UPDATED',
    details: { memberId: targetMemberId, newRole },
  });

  return targetMember;
};

export const removeMember = async (workspaceId, targetMemberId, actorId) => {
  const targetMember = await WorkspaceMember.findById(targetMemberId);
  if (!targetMember || targetMember.workspaceId.toString() !== workspaceId.toString()) {
    const error = new Error('Member not found.');
    error.statusCode = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }

  if (targetMember.role === 'workspace_owner') {
    const error = new Error('Cannot remove the workspace owner.');
    error.statusCode = 400;
    error.code = 'CANNOT_REMOVE_OWNER';
    throw error;
  }

  targetMember.status = 'inactive';
  await targetMember.save();

  await ActivityLog.create({
    workspaceId,
    actorId,
    action: 'MEMBER_REMOVED',
    details: { memberId: targetMemberId },
  });

  return { success: true };
};
