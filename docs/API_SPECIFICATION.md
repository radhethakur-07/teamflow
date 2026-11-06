# TeamFlow — RESTful API Specification

**Document Version:** 1.0.0  
**Status:** Approved for Milestone 0  
**Base URL:** `/api/v1`  
**Protocol:** HTTPS / JSON  
**Architect:** Senior Full-Stack & API Architect  

---

## 1. API Design Conventions

### 1.1 Response Envelope Structure
All API responses follow a uniform JSON envelope to guarantee predictable client-side consumption.

#### Successful Response Format:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

#### Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided task title exceeds the 250 character limit.",
    "details": [
      {
        "field": "title",
        "issue": "String must contain at most 250 character(s)"
      }
    ]
  }
}
```

### 1.2 HTTP Status Codes
- `200 OK`: Request succeeded; entity returned in `data`.
- `201 Created`: Resource created successfully.
- `204 No Content`: Resource deleted or mutation completed without payload.
- `400 Bad Request`: Input validation failed or malformed JSON payload.
- `401 Unauthorized`: Missing, expired, or invalid JWT Bearer token.
- `403 Forbidden`: Authenticated user lacks RBAC permissions for this resource.
- `404 Not Found`: Target entity does not exist.
- `409 Conflict`: Unique constraint violation (e.g. duplicate email, duplicate workspace slug).
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unhandled server exception (stack trace redacted in production).

---

## 2. Authentication & Profile Endpoints

### 2.1 Register User
- **Method & Route:** `POST /api/v1/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "6724a1b0c9...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "avatarUrl": "",
        "createdAt": "2026-11-06T14:00:00.000Z"
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### 2.2 Login User
- **Method & Route:** `POST /api/v1/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "6724a1b0c9...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "avatarUrl": "",
        "defaultWorkspaceId": "6724a2f8c9..."
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

### 2.3 Refresh Token
- **Method & Route:** `POST /api/v1/auth/refresh-token`
- **Auth Required:** No (Carries refresh token in body or HTTP-only cookie)
- **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
- **Response `200 OK`:** Returns new `accessToken` and rotated `refreshToken`.

### 2.4 Get Current Profile
- **Method & Route:** `GET /api/v1/auth/me`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response `200 OK`:** Returns current authenticated user record and active workspace memberships.

---

## 3. Workspace Endpoints

### 3.1 List User Workspaces
- **Method & Route:** `GET /api/v1/workspaces`
- **Auth Required:** Yes
- **Response `200 OK`:** Array of workspaces with current user's role in each.

### 3.2 Create Workspace
- **Method & Route:** `POST /api/v1/workspaces`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "name": "Acme Product Studio",
    "description": "Design and engineering workspace"
  }
  ```
- **Response `201 Created`:** Workspace document; automatically creates `workspace_members` record with role `workspace_owner`.

### 3.3 Get Workspace Details
- **Method & Route:** `GET /api/v1/workspaces/:workspaceId`
- **Auth Required:** Yes (Member of workspace)
- **Response `200 OK`:** Workspace metadata, project summaries, and active member list.

### 3.4 Update Workspace
- **Method & Route:** `PATCH /api/v1/workspaces/:workspaceId`
- **Auth Required:** Yes (`workspace_owner` or `admin`)
- **Request Body:** `{ "name": "Acme Labs", "description": "Updated description" }`

### 3.5 Manage Members
- **List Members:** `GET /api/v1/workspaces/:workspaceId/members`
- **Update Role:** `PATCH /api/v1/workspaces/:workspaceId/members/:memberId` (`workspace_owner` or `admin`)
- **Remove Member:** `DELETE /api/v1/workspaces/:workspaceId/members/:memberId` (`workspace_owner` or `admin`)

---

## 4. Invitation Endpoints

### 4.1 Send Workspace Invitation
- **Method & Route:** `POST /api/v1/workspaces/:workspaceId/invitations`
- **Auth Required:** Yes (`workspace_owner` or `admin`)
- **Request Body:**
  ```json
  {
    "email": "colleague@example.com",
    "role": "team_member"
  }
  ```
- **Response `201 Created`:** Generated token and invitation record.

### 4.2 Accept Invitation
- **Method & Route:** `POST /api/v1/invitations/:token/accept`
- **Auth Required:** Yes (Authenticated recipient)
- **Response `200 OK`:** Adds user to `workspace_members` and marks invitation as `accepted`.

---

## 5. Project & Kanban Endpoints

### 5.1 List Workspace Projects
- **Method & Route:** `GET /api/v1/workspaces/:workspaceId/projects`
- **Auth Required:** Yes
- **Query Params:** `?status=active|archived`

### 5.2 Create Project
- **Method & Route:** `POST /api/v1/workspaces/:workspaceId/projects`
- **Auth Required:** Yes (`workspace_owner`, `admin`, or `project_manager`)
- **Request Body:**
  ```json
  {
    "name": "Mobile App Redesign",
    "description": "Q4 design sprint and Flutter migration",
    "color": "#C85A32"
  }
  ```
- **Response `201 Created`:** Creates project and automatically provisions 4 default workflow columns: "To Do", "In Progress", "In Review", "Done".

### 5.3 Get Project Board Snapshot
- **Method & Route:** `GET /api/v1/projects/:projectId`
- **Auth Required:** Yes
- **Response `200 OK`:** Returns project metadata, full array of columns, and all active tasks mapped to their respective columns.

---

## 6. Column & Task Endpoints

### 6.1 Column Management
- **Create Column:** `POST /api/v1/projects/:projectId/columns`
  ```json
  { "title": "QA Testing", "orderIndex": 3, "color": "#8F819E" }
  ```
- **Update Column:** `PATCH /api/v1/columns/:columnId`
- **Delete Column:** `DELETE /api/v1/columns/:columnId?transferToColumnId=:targetId`
- **Reorder Columns:** `PUT /api/v1/projects/:projectId/columns/reorder`
  ```json
  { "columnOrder": ["colId1", "colId2", "colId3"] }
  ```

### 6.2 Task Management
- **Create Task:** `POST /api/v1/projects/:projectId/tasks`
  ```json
  {
    "columnId": "6724b01...",
    "title": "Implement JWT Auth Middleware",
    "description": "Support short-lived access tokens and refresh rotation.",
    "priority": "high",
    "dueDate": "2026-11-15T00:00:00.000Z",
    "assigneeIds": ["6724a1b0c9..."],
    "tags": ["backend", "security"]
  }
  ```
- **Update Task:** `PATCH /api/v1/tasks/:taskId`
  ```json
  {
    "title": "Updated Task Title",
    "priority": "urgent",
    "description": "Updated details..."
  }
  ```
- **Move Task (Drag-and-Drop Mutation):** `PATCH /api/v1/tasks/:taskId/move`
  ```json
  {
    "targetColumnId": "6724b02...",
    "newOrderIndex": 1500
  }
  ```
  *Broadcasts `task:moved` event via Socket.IO to connected room peers.*

- **Delete / Archive Task:** `DELETE /api/v1/tasks/:taskId`
- **Checklist Toggle:** `PATCH /api/v1/tasks/:taskId/checklist/:itemId`
  ```json
  { "completed": true }
  ```

---

## 7. Comments & Activity Stream

### 7.1 Comments
- **List Task Comments:** `GET /api/v1/tasks/:taskId/comments`
- **Add Comment:** `POST /api/v1/tasks/:taskId/comments`
  ```json
  { "content": "Review completed. Merging PR #42." }
  ```
- **Delete Comment:** `DELETE /api/v1/comments/:commentId`

### 7.2 Activity Log
- **Workspace Activity Stream:** `GET /api/v1/workspaces/:workspaceId/activity?limit=25&page=1`
- **Project Activity Stream:** `GET /api/v1/projects/:projectId/activity?limit=25`

---

## 8. Notifications & Health Check

### 8.1 Notifications
- **List User Notifications:** `GET /api/v1/notifications?read=false`
- **Mark Notification Read:** `PATCH /api/v1/notifications/:id/read`
- **Batch Mark All Read:** `POST /api/v1/notifications/mark-all-read`

### 8.2 Health Check
- **Method & Route:** `GET /api/v1/health`
- **Auth Required:** No
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-06T14:30:00.000Z",
    "uptime": 1420.5,
    "database": "connected"
  }
  ```
