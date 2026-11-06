import mongoose from 'mongoose';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { Project } from '../models/Project.js';

export class RoomManager {
  /**
   * Validate whether a user has permission to join a requested room.
   * Never trust raw room strings provided by the client.
   */
  static async validateRoomAccess(userId, roomName) {
    if (!roomName || typeof roomName !== 'string') {
      return { allowed: false, error: 'Room identifier is invalid' };
    }

    const parts = roomName.split(':');
    if (parts.length < 2) {
      return { allowed: false, error: 'Malformed room name format' };
    }

    const [type, id] = parts;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { allowed: false, error: 'Target ID is not a valid ObjectId' };
    }

    // 1. Personal user notification room (only allow self)
    if (type === 'user') {
      if (id !== userId.toString()) {
        return { allowed: false, error: 'Cannot join another user notification room' };
      }
      return { allowed: true, canonicalRoom: `user:${id}` };
    }

    // 2. Workspace general room
    if (type === 'workspace') {
      const membership = await WorkspaceMember.findOne({
        workspaceId: id,
        userId: userId,
        status: 'active',
      });

      if (!membership) {
        return { allowed: false, error: 'You are not an active member of this workspace' };
      }

      return { allowed: true, canonicalRoom: `workspace:${id}`, workspaceId: id };
    }

    // 3. Project chat / task board room
    if (type === 'project') {
      const project = await Project.findById(id);
      if (!project) {
        return { allowed: false, error: 'Project does not exist' };
      }

      const membership = await WorkspaceMember.findOne({
        workspaceId: project.workspaceId,
        userId: userId,
        status: 'active',
      });

      if (!membership) {
        return { allowed: false, error: 'You do not belong to the workspace for this project' };
      }

      // If project is private, user must be owner/admin or in memberIds
      if (project.isPrivate) {
        const isElevated = ['workspace_owner', 'workspace_admin', 'project_manager'].includes(membership.role);
        const isMember = project.memberIds?.some((m) => m.toString() === userId.toString());
        if (!isElevated && !isMember) {
          return { allowed: false, error: 'Project is private and you are not assigned to it' };
        }
      }

      return { allowed: true, canonicalRoom: `project:${id}`, workspaceId: project.workspaceId.toString() };
    }

    // 4. Direct message room between two users within a workspace: direct:userId1_userId2
    if (type === 'direct') {
      const otherUserId = id;
      if (otherUserId === userId.toString()) {
        return { allowed: false, error: 'Cannot open direct channel with yourself' };
      }

      // Verify other user exists and shares at least one workspace
      const myWorkspaces = await WorkspaceMember.find({ userId: userId, status: 'active' }).select('workspaceId');
      const myWsIds = myWorkspaces.map((m) => m.workspaceId.toString());

      const sharedMembership = await WorkspaceMember.findOne({
        workspaceId: { $in: myWsIds },
        userId: otherUserId,
        status: 'active',
      });

      if (!sharedMembership) {
        return { allowed: false, error: 'User does not share an active workspace with you' };
      }

      // Sort user IDs lexicographically for deterministic room name
      const sortedUsers = [userId.toString(), otherUserId].sort();
      const directRoom = `direct:${sortedUsers[0]}_${sortedUsers[1]}`;

      return {
        allowed: true,
        canonicalRoom: directRoom,
        workspaceId: sharedMembership.workspaceId.toString(),
      };
    }

    return { allowed: false, error: `Unsupported room type: ${type}` };
  }
}

export default RoomManager;
