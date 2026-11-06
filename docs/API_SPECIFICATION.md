# TeamFlow — RESTful API Specification

**Document Version:** 1.2.0  
**Status:** Approved for Milestone 3  
**Base URL:** `/api/v1`  
**Protocol:** HTTPS / JSON  
**Architect:** Senior Node.js Backend Architect  

---

## 1. API Conventions & Standard Response Envelopes

All API endpoints follow a predictable JSON response structure.

### Successful Response Format (`sendSuccess` / `sendCreated`):
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { ... }
}
```

### Paginated Response Format (`sendPaginated`):
```json
{
  "success": true,
  "message": "Projects retrieved",
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Error Response Format (`sendError` / `errorHandler`):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_WORKSPACE_ACCESS",
    "message": "You are not a member of this workspace.",
    "details": null
  }
}
```

---

## 2. API Endpoint Matrix

### 2.1 Authentication & Profile (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required | Cookie / Header |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | Register user, send Brevo verification OTP, set HttpOnly refresh cookie | No | Sets `teamflow_refresh_token` |
| `POST` | `/api/v1/auth/verify-email` | Validate 6-digit email confirmation code | No | - |
| `POST` | `/api/v1/auth/resend-verification` | Resend 6-digit verification code with rate limiting | No | - |
| `POST` | `/api/v1/auth/login` | Authenticate password / Brevo OTP challenge; set HttpOnly cookie | No | Sets `teamflow_refresh_token` |
| `POST` | `/api/v1/auth/login/otp` | Complete two-factor sign-in with 6-digit verification code | No | Sets `teamflow_refresh_token` |
| `POST` | `/api/v1/auth/refresh-token` | Rotate refresh token with reuse detection; rotate HttpOnly cookie | No (Cookie) | Cookie: `teamflow_refresh_token` |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token in database & clear HttpOnly cookie | No (Cookie) | Clears `teamflow_refresh_token` |
| `POST` | `/api/v1/auth/logout-all` | Revoke all active sessions across all devices for the user | Yes | Clears `teamflow_refresh_token` |
| `POST` | `/api/v1/auth/forgot-password` | Single-use password reset OTP via Brevo (anti-enumeration) | No | - |
| `POST` | `/api/v1/auth/reset-password` | Validate OTP, update password hash, revoke all existing sessions | No | - |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & active workspace list | Yes | `Authorization: Bearer <token>` |
| `PUT` | `/api/v1/auth/me` | Update user profile fields (name, avatar, jobTitle, bio) | Yes | `Authorization: Bearer <token>` |
| `PUT` | `/api/v1/auth/password` | Update account password with current password verification | Yes | `Authorization: Bearer <token>` |

### 2.2 Workspaces (`/api/v1/workspaces`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/workspaces` | List active workspaces user belongs to | Member |
| `POST` | `/api/v1/workspaces` | Create new workspace & assign `workspace_owner` | Authenticated |
| `GET` | `/api/v1/workspaces/:workspaceId` | Get workspace details & member count | Member |
| `PATCH`| `/api/v1/workspaces/:workspaceId` | Update workspace settings | Owner, Admin |
| `GET` | `/api/v1/workspaces/:workspaceId/members` | List members with populated user details | Member |
| `POST` | `/api/v1/workspaces/:workspaceId/invitations` | Issue 48h invitation token to colleague | Owner, Admin |
| `POST` | `/api/v1/workspaces/invitations/:token/accept` | Accept pending invitation token | Authenticated |
| `PATCH`| `/api/v1/workspaces/:workspaceId/members/:memberId` | Update member role (Owner safeguarded) | Owner, Admin |
| `DELETE`| `/api/v1/workspaces/:workspaceId/members/:memberId`| Remove member from workspace | Owner, Admin |

### 2.3 Teams (`/api/v1/workspaces/:workspaceId/teams`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/workspaces/:workspaceId/teams` | List teams in workspace | Member |
| `POST` | `/api/v1/workspaces/:workspaceId/teams` | Create new functional team squad | Owner, Admin, PM |
| `GET` | `/api/v1/workspaces/:workspaceId/teams/:teamId` | Get team details & member roster | Member |
| `PATCH`| `/api/v1/workspaces/:workspaceId/teams/:teamId` | Update team details & members | Owner, Admin, PM |
| `DELETE`| `/api/v1/workspaces/:workspaceId/teams/:teamId`| Delete team | Owner, Admin |

### 2.4 Projects (`/api/v1/workspaces/:workspaceId/projects` & `/api/v1/projects/:projectId`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/workspaces/:workspaceId/projects` | List projects with dynamic task throughput | Member |
| `POST` | `/api/v1/workspaces/:workspaceId/projects` | Create project with color accent | Owner, Admin, PM |
| `GET` | `/api/v1/projects/:projectId` | Get project details, throughput & team | Member |
| `PATCH`| `/api/v1/projects/:projectId` | Update project details, status or lead | Owner, Admin, PM |
| `DELETE`| `/api/v1/projects/:projectId` | Archive project and associated tasks | Owner, Admin |
| `GET` | `/api/v1/projects/:projectId/activities` | Audit trail of project activities | Member |

### 2.5 Tasks & Comments (`/api/v1/tasks`, `/api/v1/projects/:projectId/tasks`, `/api/v1/workspaces/:workspaceId/tasks`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/workspaces/:workspaceId/tasks/my-tasks` | Get authenticated user's assigned tasks in workspace | Member |
| `GET` | `/api/v1/workspaces/:workspaceId/tasks/all` | List workspace tasks with sorting, search & filtering | Member |
| `GET` | `/api/v1/projects/:projectId/tasks` | Get project tasks filtered by column/priority | Member |
| `POST` | `/api/v1/projects/:projectId/tasks` | Create task with priority & assignees | Member |
| `GET` | `/api/v1/tasks/:taskId` | Get task details with checklists and comments | Member |
| `PATCH`| `/api/v1/tasks/:taskId` | Update task title, description, priority, column, due date | Member |
| `PATCH`| `/api/v1/tasks/:taskId/move` | Move task to new column & fractional orderIndex | Member |
| `DELETE`| `/api/v1/tasks/:taskId` | Soft archive task | Owner, Admin, PM |
| `POST` | `/api/v1/tasks/:taskId/checklist` | Add checklist item to task | Member |
| `PATCH`| `/api/v1/tasks/:taskId/checklist/:itemId` | Toggle checklist item completion | Member |
| `DELETE`| `/api/v1/tasks/:taskId/checklist/:itemId` | Remove checklist item from task | Member |
| `GET` | `/api/v1/tasks/:taskId/comments` | Retrieve task comments with author populated | Member |
| `POST` | `/api/v1/tasks/:taskId/comments` | Post comment to task and record audit activity | Member |
| `DELETE`| `/api/v1/tasks/:taskId/comments/:commentId` | Delete comment (author or admin) | Member |

### 2.6 Real-Time Chat & Direct Messaging (`/api/v1/workspaces/:workspaceId/messages`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/workspaces/:workspaceId/messages` | Fetch message history by `channelId` or `recipientId` | Member |
| `POST` | `/api/v1/workspaces/:workspaceId/messages` | Send message with server broadcast to room | Member |
| `POST` | `/api/v1/workspaces/:workspaceId/messages/read` | Mark messages in chat/channel as read | Member |
| `GET` | `/api/v1/workspaces/:workspaceId/messages/unread-counts` | Retrieve unread count breakdown per channel & direct recipient | Member |

### 2.7 Notifications (`/api/v1/notifications`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/notifications` | Retrieve user notification inbox | Yes |
| `PATCH`| `/api/v1/notifications/:id/read` | Mark single notification as read | Yes |
| `POST` | `/api/v1/notifications/mark-all-read` | Mark all user notifications as read | Yes |

### 2.8 Activities & Audit Trails
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/workspaces/:workspaceId/activities` | Chronological activity log for workspace | Member |
| `GET` | `/api/v1/projects/:projectId/activities` | Chronological activity log for project | Member |

### 2.9 Health & Readiness Probes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Liveness probe: returns server uptime, memory usage, node version | No |
| `GET` | `/api/health/ready` | Readiness probe: checks active MongoDB connection state (200/503) | No |

### 2.10 Workspace Real Analytics Engine
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/workspaces/:workspaceId/analytics?timeframe=7d\|30d\|90d\|all` | Returns real database aggregations: task breakdown, completion rate, overdue tasks, project completion %, team workload, and activity velocity | Member |

### 2.11 Task Attachments & File Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/tasks/:taskId/attachments` | Retrieves list of all file attachments uploaded for task | Member |
| `POST` | `/api/v1/tasks/:taskId/attachments` | Creates attachment record with fileName, fileUrl, fileSize, mimeType (max 10MB) | Member |
| `DELETE` | `/api/v1/tasks/:taskId/attachments/:attachmentId` | Deletes attachment (requires task author or workspace admin) | Member/Admin |

### 2.12 Cloudinary Direct Upload & Asset Relay
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/upload/signature?folder=teamflow/...` | Generates signed Cloudinary SHA1 signature for direct client upload (with dev simulation fallback) | User |
| `POST` | `/api/v1/upload` | Server-side upload handler (accepts base64/data URI with Cloudinary relay or fallback) | User |

---

## 3. Real-Time Socket.IO Protocol Specification

### 3.1 Handshake Authentication & Room Access Policy
- **Connection Handshake:**
  - Token passed in `auth.token` or `headers.authorization` (`Bearer <token>`).
  - Sockets without valid access tokens are immediately rejected with `AUTHENTICATION_REQUIRED` or `INVALID_TOKEN`.
- **Authorized Room Syntax & Verification:**
  - `workspace:<workspaceId>`: Validated against active `WorkspaceMember` status.
  - `project:<projectId>`: Validated against workspace membership & private project access.
  - `direct:<userA>_<userB>`: Validated against shared workspace membership.
  - `user:<userId>`: Self-only private notification inbox.

### 3.2 Real-Time Event Matrix
| Direction | Event Name | Payload Summary | Description |
| :--- | :--- | :--- | :--- |
| Client &rarr; Server | `room:join` | `{ room: string }` | Request to enter room with membership validation |
| Client &rarr; Server | `room:leave` | `{ room: string }` | Leave room |
| Client &rarr; Server | `message:send` | `{ workspaceId, recipientId, channelId, content, clientTempId }` | Send chat message; persists in DB & broadcasts |
| Server &rarr; Client | `message:received` | `{ room, message }` | Real-time chat message broadcast to room |
| Client &rarr; Server | `typing:start` | `{ room }` | Emits typing state to other room members |
| Client &rarr; Server | `typing:stop` | `{ room }` | Cancels typing state |
| Server &rarr; Client | `typing:update` | `{ room, userId, userName, isTyping }` | Live typing indicator broadcast |
| Client &rarr; Server | `message:read` | `{ room, messageIds: string[] }` | Marks messages read and updates database |
| Server &rarr; Client | `message:read_receipt` | `{ room, readerId, messageIds }` | Broadcasts double-check read status |
| Server &rarr; Client | `presence:update` | `{ userId, status: 'online' \| 'offline' }` | Multi-tab connection presence broadcast |
| Server &rarr; Client | `task:created` | `{ eventType, workspaceId, projectId, task }` | Live task creation sync |
| Server &rarr; Client | `task:moved` | `{ eventType, workspaceId, projectId, task }` | Live Kanban board drag-and-drop sync |
| Server &rarr; Client | `task:updated` | `{ eventType, workspaceId, projectId, task }` | Live task details/checklist update |
| Server &rarr; Client | `task:deleted` | `{ eventType, workspaceId, projectId, task }` | Live task removal sync |
| Server &rarr; Client | `notification:new` | Notification object | Instant personal push notification |
