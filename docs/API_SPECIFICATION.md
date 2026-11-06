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

### 2.1 Authentication & Profile (`/api/v1/auth` & `/api/v1/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register user & auto-provision default workspace | No |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password; returns JWTs | No |
| `POST` | `/api/v1/auth/refresh-token`| Rotate short-lived access token with refresh token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile & active workspace list | Yes |
| `PUT` | `/api/v1/auth/password` | Update account password with current password verification | Yes |

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

### 2.5 Tasks (`/api/v1/projects/:projectId/tasks` & `/api/v1/tasks/:taskId`)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/projects/:projectId/tasks` | Get project tasks filtered by column/priority | Member |
| `POST` | `/api/v1/projects/:projectId/tasks` | Create task with priority & assignees | Member |
| `GET` | `/api/v1/tasks/:taskId` | Get task details with checklists | Member |
| `PATCH`| `/api/v1/tasks/:taskId` | Update task title, description, priority | Member |
| `PATCH`| `/api/v1/tasks/:taskId/move` | Move task to new column & fractional orderIndex | Member |
| `DELETE`| `/api/v1/tasks/:taskId` | Soft archive task | Owner, Admin, PM |
| `POST` | `/api/v1/tasks/:taskId/checklist` | Add checklist item to task | Member |
| `PATCH`| `/api/v1/tasks/:taskId/checklist/:itemId` | Toggle checklist item completion | Member |

### 2.6 Health & Readiness Probes
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Liveness probe: returns server uptime, memory usage, node version | No |
| `GET` | `/api/health/ready` | Readiness probe: checks active MongoDB connection state (200/503) | No |
