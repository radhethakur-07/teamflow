# TeamFlow — User Flows & Interaction Workflows

**Document Version:** 1.0.0  
**Status:** Approved for Milestone 0  
**UX & Product Lead:** Senior SaaS Product Architect & UI/UX Designer  

---

## 1. Flow 1: User Onboarding & Workspace Initialization

This flow illustrates the user journey from initial arrival to fully provisioned workspace and initial team invitation.

```mermaid
sequenceDiagram
    autonumber
    actor User as New User
    participant Web as Web App (Vite React)
    participant API as Express API
    participant DB as MongoDB Atlas

    User->>Web: Navigate to /register
    Web-->>User: Render Warm Ivory Registration Form
    User->>Web: Enter Name, Email, Password & Submit
    Web->>API: POST /api/v1/auth/register
    API->>DB: Check email uniqueness & save user
    DB-->>API: User persisted
    API-->>Web: 201 Created + JWT Tokens
    Web->>Web: Store JWT & set auth state
    Web-->>User: Display "Create First Workspace" Modal
    User->>Web: Enter Workspace Name ("Acme Studio") & Submit
    Web->>API: POST /api/v1/workspaces
    API->>DB: Create Workspace & WorkspaceMember (role: 'workspace_owner')
    DB-->>API: Workspace Created
    API-->>Web: 201 Created { workspace }
    Web-->>User: Route to /workspaces/:id/dashboard
    Web-->>User: Display "Invite Your Team" action banner
```

---

## 2. Flow 2: Project Creation & Kanban Workflow Setup

```mermaid
flowchart TD
    Start([Workspace Dashboard]) --> ClickNew["Click '+ New Project' Button"]
    ClickNew --> Modal["Open Project Creation Modal"]
    Modal --> Form["Enter Name, Description & Select Color"]
    Form --> Submit{"Click 'Create Project'"}
    
    Submit --> APIReq["POST /api/v1/workspaces/:id/projects"]
    APIReq --> Backend["Backend creates Project & auto-seeds 4 Default Columns:<br/>(To Do, In Progress, Review, Done)"]
    Backend --> DB[(Save to MongoDB)]
    DB --> Response["Return 201 Created with Project & Columns"]
    Response --> Redirect["Redirect to /workspaces/:id/projects/:projectId"]
    Redirect --> RenderBoard["Render Kanban Board with Columns Ready"]
```

---

## 3. Flow 3: Complete Task Lifecycle (Creation &rarr; Movement &rarr; Completion)

```mermaid
sequenceDiagram
    autonumber
    actor User as Team Member
    participant Board as Kanban UI
    participant Store as Zustand Board Store
    participant API as Express REST API
    participant Sockets as Socket.IO Hub

    User->>Board: Click "+ Add Task" in "To Do" Column
    Board-->>User: Show inline quick-entry input
    User->>Board: Enter Title & Press Enter
    Board->>Store: Optimistic Task Insertion
    Board->>API: POST /api/v1/projects/:id/tasks
    API->>Sockets: Emit `task:created` to project room
    API-->>Board: 201 Created (Confirmed Task ID)
    
    Note over User,Board: Drag and Drop Action
    User->>Board: Drag Task from "To Do" to "In Progress"
    Board->>Store: Optimistic Card Reorder & Position Calculation
    Board->>API: PATCH /api/v1/tasks/:taskId/move
    API->>Sockets: Broadcast `task:moved` to all peer clients
    API-->>Board: 200 OK (Confirmed state)

    Note over User,Board: Detailed Inspection & Checklists
    User->>Board: Click Task Card to open TaskDetailModal
    Board-->>User: Render Task Modal with Checklists, Assignees & Comments
    User->>Board: Add Checklist Item ("Write Unit Tests") & Check off
    Board->>API: PATCH /api/v1/tasks/:taskId/checklist/:itemId
    API-->>Board: 200 OK
```

---

## 4. Flow 4: Real-Time Multi-User Collaboration & Synchronization

Demonstrates how two concurrent users collaborate on the same Kanban board without collision or stale state.

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Alice (Project Manager)
    actor Bob as Bob (Engineer)
    participant Server as Node.js / Socket.IO
    participant DB as MongoDB

    Note over Alice,Bob: Both connected to project room: project:proj_123
    Alice->>Server: PATCH /api/v1/tasks/task_99/move (Moved to 'Done')
    Server->>DB: Atomic update task columnId & orderIndex
    DB-->>Server: Write confirmed
    Server-->>Alice: HTTP 200 OK
    Server-)Bob: Socket event: `task:moved` { taskId: 'task_99', targetColumnId: 'col_done' }
    Bob->>Bob: Smoothly animate card from 'In Progress' to 'Done'
    
    Bob->>Server: POST /api/v1/tasks/task_99/comments { content: "Great job Alice!" }
    Server->>DB: Save comment & log activity
    DB-->>Server: Saved
    Server-->>Bob: HTTP 201 Created
    Server-)Alice: Socket event: `comment:added` { taskId: 'task_99', ... }
    Alice->>Alice: Display new comment in open drawer & show toast
```

---

## 5. Flow 5: Team Member Invitation & Role Assignment

```mermaid
flowchart TD
    Admin([Admin / Workspace Owner]) --> Navigate["Go to Workspace Settings -> Members"]
    Navigate --> OpenInvite["Click 'Invite Member'"]
    OpenInvite --> InviteForm["Input Colleague Email & Select Role (e.g. Project Manager)"]
    InviteForm --> Send["Click 'Send Invitation'"]
    Send --> API["POST /api/v1/workspaces/:id/invitations"]
    API --> TokenGen["Generate secure cryptographic token (48h expiry)"]
    TokenGen --> DB[(Save to invitations collection)]
    DB --> Link["Return shareable invite link & notification"]
    Link --> Invitee([Invited User])
    Invitee --> ClickLink["Invitee clicks /invite/:token"]
    ClickLink --> Validate{"User logged in?"}
    Validate -- No --> PromptLogin["Prompt Login / Register"]
    Validate -- Yes --> Accept["POST /api/v1/invitations/:token/accept"]
    Accept --> AddMember["Add user to workspace_members with assigned role"]
    AddMember --> Dashboard["Redirect to Workspace Dashboard with active access"]
```

---

## 6. Flow 6: In-App Notifications & Deep-Link Resolution

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Alice (Assignor)
    actor Bob as Bob (Assignee)
    participant API as Express API
    participant Sockets as Socket.IO
    participant DB as MongoDB

    Alice->>API: PATCH /api/v1/tasks/:id (Assign to Bob)
    API->>DB: Update task.assigneeIds
    API->>DB: Create Notification record (user: Bob._id, type: 'ASSIGNED')
    API->>Sockets: Emit `notification:new` to room `user:bob_id`
    Sockets-)Bob: Receive real-time notification
    Bob->>Bob: Increment unread badge counter in top navigation
    Bob->>Bob: Click notification bell & click assigned task alert
    Bob->>Bob: Deep-link directly opens project board & centers TaskDetailModal
    Bob->>API: PATCH /api/v1/notifications/:id/read
    API->>DB: Set read = true
```

---

## 7. Edge Cases & Resilience Flows

### 7.1 WebSocket Connection Interruption & Auto-Reconnection
1. **Drop Detection:** Socket.IO client detects heartbeat timeout or network offline event.
2. **Visual Indicator:** Top bar displays a subtle, non-intrusive status pill: *"Reconnecting..."*
3. **Exponential Backoff:** Client attempts reconnection at intervals of 1s, 2s, 5s, 10s.
4. **Resync on Reconnect:** Upon re-establishing the socket connection, the client triggers a background revalidation query (`GET /api/v1/projects/:id`) to reconcile any card moves that took place while disconnected.
5. **Success State:** Status pill transitions to *"Connected"* (Sage Green) and smoothly fades out.

### 7.2 Concurrent Move Resolution
- If two users move the same task simultaneously, the server processes the operations sequentially using atomic MongoDB updates.
- The latest completed operation broadcasts its canonical state via `task:moved`, causing all connected clients to reconcile to the server's single source of truth.
