# TeamFlow — Production MERN SaaS Platform

> **A focused, tactile, real-time project workflow platform for modern teams.** Built with React 18, Vite, Node.js, Express, MongoDB Atlas, and Socket.IO.

---

## 🌟 Executive Overview

TeamFlow is a production-quality, multi-tenant collaboration platform designed for high-velocity teams. Eschewing generic, cold blue dashboards and gloomy dark-mode templates, TeamFlow introduces a **warm, tactile editorial visual identity** (warm ivory, terracotta, sage green, mustard, lavender, and warm charcoal) paired with **sub-100ms real-time WebSocket synchronization**.

### Core Architecture Pillars:
- **Monorepo Structure:** Decoupled between `/frontend` (React + Vite), `/backend` (Express + Socket.IO), and `/docs` (Architecture & Specs).
- **Modular Express Backend:** Layered Controller-Service-Model architecture with Zod validation, JWT authentication, 4-tier RBAC middleware, and 12 Mongoose collections.
- **Warm Editorial Visual Foundation:** 15 production-grade pages built with **Plus Jakarta Sans** (headings) and **DM Sans** (body), Warm Ivory `#F8F5EF`, Terracotta `#E98269`, Sage `#91A88C`, Mustard `#E9C995`, Lavender `#C9B8D9`, and Warm Charcoal `#554B43`.
- **Zero-Friction Real-Time:** Fluid drag-and-drop Kanban boards with instant multi-user synchronization powered by Socket.IO rooms.
- **Granular Multi-Tenancy:** Workspace-isolated projects, role-based access control (RBAC), and secure tokenized invitations.
- **Production DevOps:** Continuous deployment on **Vercel** (Frontend SPA edge network) and **Render** (Backend API & WebSockets), backed by **MongoDB Atlas**.
- **High-Fidelity Engineering:** Zero fake statistics, zero dead buttons, and 100% functional data persistence.

---

## 📚 Architectural & Technical Documentation

| Document | Description |
| :--- | :--- |
| **[Product Requirements Document (PRD)](./docs/PRODUCT_REQUIREMENTS.md)** | Product vision, problem statement, user personas, MVP scope, and business metrics. |
| **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)** | C4 container diagrams, layered Express pattern, Vite SPA setup, and security architecture. |
| **[Database Design & ERD](./docs/DATABASE_DESIGN.md)** | MongoDB Atlas 12 collection schemas, Mermaid ERD, compound index strategies, and relationships. |
| **[REST API Specification](./docs/API_SPECIFICATION.md)** | RESTful API contracts, Zod schemas, endpoints for Auth, Workspaces, Teams, Projects, and Tasks. |
| **[User Flows & Interactions](./docs/USER_FLOWS.md)** | Mermaid interaction sequence diagrams for onboarding, task lifecycle, and live sync. |
| **[Role-Based Access Control (RBAC)](./docs/ROLE_PERMISSIONS.md)** | 4-tier role permission matrix (Owner, Admin, PM, Member) and middleware policy logic. |
| **[Design System & UI Guidelines](./docs/DESIGN_SYSTEM.md)** | Warm Ivory/Terracotta tokens, typography (Plus Jakarta Sans & DM Sans), and WCAG AA contrast. |
| **[Deployment & DevOps Plan](./docs/DEPLOYMENT_PLAN.md)** | Vercel SPA rewrites, Render WebSockets configuration, CI/CD pipeline, and secrets policy. |

---

## 🗂️ Backend Modular Architecture

```
backend/
├── src/
│   ├── config/                       # Database pooling (db.js) & validated env (env.js)
│   ├── controllers/                  # Request handling: auth, workspace, team, project, task
│   ├── middlewares/                  # authenticateJWT, requireWorkspaceRole, validateRequest, errorHandler
│   ├── models/                       # 12 Mongoose collections (User, Workspace, Member, Team, Project, Task, etc.)
│   ├── routes/                       # Express router modules: /auth, /workspaces, /teams, /projects, /tasks
│   ├── services/                     # Business domain logic & database mutations
│   ├── utils/                        # apiResponse, asyncHandler, jwt, password (bcrypt)
│   ├── validators/                   # Zod validation schemas for all incoming payloads
│   ├── __tests__/                    # Node.js automated test suites (models.test.js, api.test.js, health.test.js)
│   ├── app.js                        # Express app with helmet, cors, morgan, rateLimit
│   └── server.js                     # HTTP + Socket.IO server & graceful shutdown
├── render.yaml                       # Render Web Service blueprint configuration
├── .env.example
├── .gitignore
└── package.json
```

---

## 🛠️ Quickstart & Local Development

### 1. Prerequisites
- Node.js &ge; 20.0.0
- npm &ge; 10.0.0

### 2. Install Dependencies
```bash
npm install
```

### 3. Running the Application
```bash
# Start backend API (Port 5000)
npm run dev:backend

# In a separate terminal, start frontend SPA (Port 5173)
npm run dev:frontend
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Query backend health at [http://localhost:5000/api/health](http://localhost:5000/api/health).
- Query database readiness probe at [http://localhost:5000/api/health/ready](http://localhost:5000/api/health/ready).

### 4. Running Tests & Build Checks
```bash
# Run complete backend automated test suite (models & REST APIs)
npm run test:backend

# Run production Vite build check
npm run build:frontend
```

---

## 🚀 Milestone Roadmap

- [x] **Milestone 0: Product Architecture, Design System & System Specifications**
- [x] **Milestone 1: Monorepo Scaffolding, Backend Foundation & Connectivity**
- [x] **Milestone 2: Frontend Visual Foundation & Complete 15-Page Experience**
- [x] **Milestone 3: Modular & Scalable Express Backend & 12 Mongoose Collections**
  - [x] 12 Mongoose models with ObjectId refs, compound indexes, and timestamps
  - [x] Zod request validation middleware (`validateRequest`)
  - [x] 4-tier RBAC authorization middleware (`requireWorkspaceRole`)
  - [x] REST API modules for Users, Workspaces, Teams, Projects, and Tasks
  - [x] Health (`/api/health`) and readiness (`/api/health/ready`) probes
- [x] **Milestone 4: Production-Quality Authentication & Security Pipeline**
  - [x] Brevo (Sendinblue) transactional email API integration with simulated dev fallback
  - [x] 6-digit email verification OTP on registration
  - [x] Two-factor authentication & login OTP challenge
  - [x] HttpOnly, SameSite cookie-based refresh token rotation
  - [x] Refresh token reuse detection & immediate family lineage revocation
  - [x] Expiring single-use password reset OTP with anti-user-enumeration
  - [x] Logout and global session invalidation across all devices
  - [x] Redux auth slice, AuthContext, and Axios concurrency-safe 401 refresh queue
  - [x] Frontend protected routes (`<ProtectedRoute />`), password visibility toggles, and interactive confirmation modals
  - [x] 14/14 automated backend test cases passing across models, auth, and REST endpoints
- [x] **Milestone 5: Core TeamFlow Experience & End-to-End Real Backend Integration**
  - [x] Full workspace lifecycle: switcher, creation modal, invitation tokens, member management, and workspace settings
  - [x] Team squads: team creation, member roster assignment, team deletion with RBAC enforcement
  - [x] Project management: project creation with cover images, color badges, due dates, project details, and real-time task throughput metrics
  - [x] Kanban Board: 4 columns (`todo`, `inprogress`, `review`, `done`), native HTML5 drag-and-drop with optimistic UI updates & rollback on server error
  - [x] Interactive task drawer: priority updates, due dates, checklist subtasks with progress tracking, task deletion
  - [x] Real-time task comments: comment thread feed, comment posting, author deletion permissions
  - [x] Search & Quick Navigation (`SearchModal` / `Ctrl+K`): cross-entity search for projects, tasks, and members
  - [x] Personal dashboard & analytics: My Tasks view with quick completion toggles, upcoming deadlines widget, calendar month grid view
  - [x] Activity history & audit trail: workspace & project chronological event logs
  - [x] Multi-tenant IDOR defense: external workspace users strictly forbidden (HTTP 403) from accessing or modifying private tasks and projects
  - [x] 25/25 automated backend test cases passing across auth, models, REST endpoints, and Milestone 5 core workflows
- [x] **Milestone 6: Real-Time WebSockets & Live Team Collaboration**
  - [x] Socket.IO connection handshake with strict JWT authentication
  - [x] Authorized room membership verification: workspace, project, direct user, and personal notification rooms
  - [x] Multi-tab connection presence management with live online/offline tracking
  - [x] Real-time direct messaging and project-specific chat channels
  - [x] Persistent message history in MongoDB with pagination
  - [x] Real-time typing indicators with auto-timeout and animated three-dot pulse
  - [x] Read receipts with database persistence and double-check UI indicators
  - [x] Real-time task synchronization: cards move/update live across all connected browsers on drag-and-drop
  - [x] Real-time push notifications for task assignments and mentions
  - [x] Unread message counts and channel badges
  - [x] Polished editorial chat interface (`/chat`) with responsive mobile channel drawer
  - [x] 37/37 automated backend tests passing across models, auth, core workflows, and real-time socket events
- [x] **Milestone 7: Product Polish, Real Analytics, File Attachments & Performance**
  - [x] Real database analytics engine (`/api/v1/workspaces/:workspaceId/analytics`) with MongoDB aggregations for task breakdown, project completion %, overdue count, team capacity, and activity velocity
  - [x] Timeframe filter controls (`7d`, `30d`, `90d`, `all`) with dynamic metric calculations
  - [x] Task file attachments subsystem (`/api/v1/tasks/:taskId/attachments`) backed by Mongoose with 10MB file limit & MIME type enforcement
  - [x] Cloudinary signed upload integration (`/api/v1/upload/signature` and `/api/v1/upload`) with development fallback simulation
  - [x] Interactive task attachment management in Kanban drawer: thumbnail previews, download links, and author deletion
  - [x] Team calendar with dual views: Monthly Grid and Weekly Timeline View with project milestone deadlines
  - [x] User notification preferences: email on task assigned, comments, deadlines due soon, and in-app push alerts
  - [x] Code-splitting & dynamic imports (`React.lazy` + `<Suspense />`) eliminating monolithic chunks
  - [x] Vite Rollup chunk optimization (`manualChunks`) with all output bundles under 160kB
  - [x] Vercel edge deployment configuration (`vercel.json`) with SPA routing rewrites and security headers
  - [x] Render backend blueprint configuration (`render.yaml`) with health probes and zero-hardcoded secrets
  - [x] Production database seed script (`backend/src/scripts/seed.js`) with Acme Innovation Lab demo workspace
  - [x] 45/45 automated backend tests passing across models, auth, core workflows, real-time sockets, and analytics/attachments suite
- [x] **Milestone 8: Production QA, Security Audit, E2E Verification & Cloud Deployment**
  - [x] Full security audit completed: 0 exposed secrets, SameSite/HttpOnly cookie protections, CORS origin whitelisting, 4-tier IDOR defense, and 10MB payload size limits
  - [x] Comprehensive End-to-End production test suite ([`backend/src/__tests__/milestone8-e2e-production.test.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/teamflow/backend/src/__tests__/milestone8-e2e-production.test.js)) covering user registration, workspace creation, team allocation, project milestones, Kanban move lifecycle, attachments, comments, and real analytics verification
  - [x] Frontend unit and schema validation test suite ([`frontend/src/__tests__/frontend-validation-and-utils.test.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/teamflow/frontend/src/__tests__/frontend-validation-and-utils.test.js)) verifying Zod validation schemas, byte formatting, and column transitions
  - [x] Defensive API URL normalization in [`api.js`](file:///C:/Users/Asus/.gemini/antigravity/scratch/teamflow/frontend/src/services/api.js) cleanly resolving any input format (`https://domain.com`, `/api`, or `/api/v1`)
  - [x] GitHub Actions production CI pipeline ([`.github/workflows/ci.yml`](file:///C:/Users/Asus/.gemini/antigravity/scratch/teamflow/.github/workflows/ci.yml)) running syntax checks, 52 backend tests, 6 frontend tests, and production Vite builds
  - [x] Total automated test suite: **58/58 passing automated tests** (52 backend + 6 frontend)
  - [x] Complete deployment verification checklist, environment configuration guide, and known limitations documented below

---

## 🔒 Security Audit & Hardening Matrix

| Security Domain | Implementation / Defense | Verification Status |
| :--- | :--- | :---: |
| **Exposed Secrets** | Zero secrets in Git; all keys loaded via `process.env` with `.env.example` templates | Verified (Clean git tree) |
| **Authentication** | SameSite HttpOnly refresh cookies, rotation with reuse detection, bcrypt salt rounds = 12 | Verified (52/52 Tests) |
| **Multi-Tenant IDOR** | All database lookups verify `workspaceId` and role membership; external workspace users receive HTTP 403 | Verified (E2E Test #2) |
| **Role-Based Access (RBAC)**| 4-tier role enforcement (`workspace_owner`, `admin`, `project_manager`, `team_member`) on projects/teams | Verified (E2E Test #3) |
| **Rate Limiting** | Express Rate Limit on API (500 req/15m), Auth (30 req/15m), and OTP/Reset endpoints (10 req/10m) | Verified (`ratelimit` headers) |
| **Input Validation** | Zod schemas validate all incoming URL parameters and request bodies before controller execution | Verified (Zod Middleware) |
| **File Upload Security** | 10MB strict limit, MIME type whitelist, sanitized filenames, and Cloudinary SHA1 signatures | Verified (E2E Test #5) |
| **CORS Policy** | Restricted origin whitelist matching frontend domain, credentials enabled, preflight headers handled | Verified (`corsOptions`) |
| **HTTP Security Headers** | Helmet with `crossOriginResourcePolicy: 'cross-origin'` and Vercel edge security headers | Verified (`X-Frame-Options: DENY`) |

---

## ☁️ Production Deployment Guide

### 1. MongoDB Atlas Configuration
1. Create a free M0 or production M10 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a user (e.g. `teamflow-admin`) with `readWriteAnyDatabase` or scoped to `teamflow`.
3. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Render's dynamic IP addresses.
4. Copy your SRV connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/teamflow?retryWrites=true&w=majority`.

### 2. Backend Deployment on Render
1. Sign in to [Render](https://render.com) and click **New + > Web Service**.
2. Connect your GitHub repository containing TeamFlow.
3. Select **Root Directory:** `backend`.
4. Configure Build & Start commands:
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Health Check Path:** `/api/health`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_ACCESS_SECRET`: `<Generate with: openssl rand -hex 64>`
   - `JWT_REFRESH_SECRET`: `<Generate with: openssl rand -hex 64>`
   - `FRONTEND_URL`: `https://teamflow.vercel.app` (or your Vercel URL)
   - `CORS_ORIGIN`: `https://teamflow.vercel.app`
   - `BREVO_API_KEY`: `<Your Brevo API Key, or leave blank for dev simulation>`
   - `CLOUDINARY_CLOUD_NAME`: `<Optional Cloudinary Cloud Name>`
   - `CLOUDINARY_API_KEY`: `<Optional Cloudinary API Key>`
   - `CLOUDINARY_API_SECRET`: `<Optional Cloudinary API Secret>`
6. Deploy the service. Verify that `GET https://your-render-url.onrender.com/api/health` returns `200 OK` with `{ "status": "healthy" }`.

### 3. Frontend Deployment on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-render-url.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-render-url.onrender.com`
5. Click **Deploy**. Vercel will build the code-split bundle and distribute it to edge locations worldwide.

---

## ⚠️ Known Limitations & Operational Considerations

1. **Render Free Tier Spin-Down:** On Render's free tier, backend instances sleep after 15 minutes of inactivity. The first incoming request may take 30–50 seconds to warm up. TeamFlow displays connection diagnostic feedback and automated retry states.
2. **Brevo Email Fallback:** If `BREVO_API_KEY` is not provided, TeamFlow automatically activates its development fallback simulation, logging 6-digit OTP codes directly to server logs for verification.
3. **Cloudinary Fallback:** If Cloudinary credentials are not configured, file uploads utilize signed development mock URLs while strictly enforcing the 10MB size limit.
4. **Browser Notifications:** In-app push notifications operate across active browser tabs via Socket.IO; OS-level desktop push notifications require HTTPS and user permission grant.
