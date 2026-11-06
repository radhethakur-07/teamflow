class PresenceManager {
  constructor() {
    // Map<userId, Set<socketId>>
    this.userSockets = new Map();
    // Map<userId, Set<workspaceId>>
    this.userWorkspaces = new Map();
    // Map<socketId, userId>
    this.socketToUser = new Map();
  }

  addUserSocket(userId, socketId, workspaceIds = []) {
    const uId = userId.toString();
    this.socketToUser.set(socketId, uId);

    if (!this.userSockets.has(uId)) {
      this.userSockets.set(uId, new Set());
    }
    const sockets = this.userSockets.get(uId);
    const isFirstConnection = sockets.size === 0;
    sockets.add(socketId);

    if (!this.userWorkspaces.has(uId)) {
      this.userWorkspaces.set(uId, new Set());
    }
    const workspaces = this.userWorkspaces.get(uId);
    workspaceIds.forEach((wId) => workspaces.add(wId.toString()));

    return {
      isFirstConnection,
      activeTabsCount: sockets.size,
      workspaces: Array.from(workspaces),
    };
  }

  removeUserSocket(socketId) {
    const uId = this.socketToUser.get(socketId);
    if (!uId) return null;

    this.socketToUser.delete(socketId);
    const sockets = this.userSockets.get(uId);
    if (!sockets) return null;

    sockets.delete(socketId);
    const isLastConnection = sockets.size === 0;

    if (isLastConnection) {
      this.userSockets.delete(uId);
    }

    const workspaces = this.userWorkspaces.get(uId)
      ? Array.from(this.userWorkspaces.get(uId))
      : [];

    if (isLastConnection) {
      this.userWorkspaces.delete(uId);
    }

    return {
      userId: uId,
      isLastConnection,
      remainingTabsCount: sockets.size,
      workspaces,
    };
  }

  isUserOnline(userId) {
    const sockets = this.userSockets.get(userId.toString());
    return !!(sockets && sockets.size > 0);
  }

  getOnlineUsersForWorkspace(workspaceId) {
    const wId = workspaceId.toString();
    const online = [];
    for (const [userId, workspaces] of this.userWorkspaces.entries()) {
      if (workspaces.has(wId) && this.isUserOnline(userId)) {
        online.push(userId);
      }
    }
    return online;
  }
}

export const presenceManager = new PresenceManager();
export default presenceManager;
