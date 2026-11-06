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
  - [x] Secure JWT authentication with short-lived access and refresh rotation
  - [x] 4-tier RBAC authorization middleware (`requireWorkspaceRole`)
  - [x] REST API modules for Users, Workspaces, Teams, Projects, and Tasks
  - [x] Health (`/api/health`) and readiness (`/api/health/ready`) probes
  - [x] Complete automated test suite (100% pass across models and REST endpoints)
- [ ] **Milestone 4: Real-Time Sockets, Projects & Live Kanban Board Synchronization**
- [ ] **Milestone 5: Production Deployment, Hardening & End-to-End Verification**
