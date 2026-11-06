# TeamFlow — Production MERN SaaS Platform

> **A focused, tactile, real-time project workflow platform for modern teams.** Built with React 18, Vite, Node.js, Express, MongoDB Atlas, and Socket.IO.

---

## 🌟 Executive Overview

TeamFlow is a production-quality, multi-tenant collaboration platform designed for high-velocity teams. Eschewing generic, cold blue dashboards and gloomy dark-mode templates, TeamFlow introduces a **warm, tactile editorial visual identity** (warm ivory, terracotta, sage green, and warm charcoal) paired with **sub-100ms real-time WebSocket synchronization**.

### Core Architecture Pillars:
- **Monorepo Structure:** Clean decoupling between `/frontend` (React + Vite), `/backend` (Express + Socket.IO), and `/docs` (Architecture & Specs).
- **Zero-Friction Real-Time:** Fluid drag-and-drop Kanban boards with instant multi-user synchronization powered by Socket.IO rooms.
- **Granular Multi-Tenancy:** Workspace-isolated projects, role-based access control (RBAC), and secure tokenized invitations.
- **Production DevOps:** Continuous deployment on **Vercel** (Frontend SPA edge network) and **Render** (Backend API & WebSockets), backed by **MongoDB Atlas**.
- **High-Fidelity Engineering:** Zero fake statistics, zero dead buttons, and 100% functional data persistence.

---

## 📚 Architectural & Technical Documentation

The complete architectural foundation developed in **Milestone 0** is documented across 8 comprehensive specifications:

| Document | Description |
| :--- | :--- |
| **[Product Requirements Document (PRD)](./docs/PRODUCT_REQUIREMENTS.md)** | Product vision, problem statement, user personas, MVP scope, and business metrics. |
| **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)** | C4 container diagrams, layered Express pattern, Vite SPA setup, and security architecture. |
| **[Database Design & ERD](./docs/DATABASE_DESIGN.md)** | MongoDB Atlas schema specifications, Mermaid ERD, indexing strategies, and relations. |
| **[REST API Specification](./docs/API_SPECIFICATION.md)** | Standard JSON envelopes, endpoints for Auth, Workspaces, Projects, Tasks, and Comments. |
| **[User Flows & Interactions](./docs/USER_FLOWS.md)** | Mermaid interaction sequence diagrams for onboarding, task lifecycle, and live sync. |
| **[Role-Based Access Control (RBAC)](./docs/ROLE_PERMISSIONS.md)** | 4-tier role permission matrix (Owner, Admin, PM, Member) and middleware policy logic. |
| **[Design System & UI Guidelines](./docs/DESIGN_SYSTEM.md)** | Warm Ivory/Terracotta tokens, typography (Plus Jakarta Sans & DM Sans), and WCAG AA contrast. |
| **[Deployment & DevOps Plan](./docs/DEPLOYMENT_PLAN.md)** | Vercel SPA rewrites, Render WebSockets configuration, CI/CD pipeline, and secrets policy. |

---

## 🎨 Visual Identity & Color Palette

TeamFlow follows a warm, tactile, editorial palette designed for ergonomic focus and visual clarity:

- **Canvas Background:** Warm Ivory (`#FAF8F5`, `#F4EFEA`)
- **Primary Accent / Brand:** Terracotta (`#C85A32`, `#9F4120`)
- **Success & Completion:** Sage Green (`#588157`, `#E8EFE9`)
- **Warnings & In-Progress:** Soft Mustard (`#D4A373`, `#FDF6ED`)
- **Review & Secondary:** Muted Lavender (`#8F819E`, `#F0EDF5`)
- **Primary Typography:** Warm Charcoal (`#2B2A27`)
- **Typography Fonts:** **Plus Jakarta Sans** (Headings) and **DM Sans** (Body & Controls)

---

## 🗂️ Monorepo Directory Hierarchy

```
teamflow/
├── .github/                          # Continuous integration workflows
│   └── workflows/
│       └── ci.yml                    # Automated build, syntax, and test checks
├── .gitignore                        # Global ignore (secrets, build outputs, node_modules)
├── package.json                      # Monorepo orchestration scripts
├── README.md                         # Project overview, quickstart & milestone tracking
├── docs/                             # Complete technical and architectural specifications
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── API_SPECIFICATION.md
│   ├── USER_FLOWS.md
│   ├── ROLE_PERMISSIONS.md
│   ├── DESIGN_SYSTEM.md
│   └── DEPLOYMENT_PLAN.md
├── backend/                          # Node.js + Express + Socket.IO API
│   ├── src/
│   │   ├── config/                   # Database (db.js) & environment (env.js)
│   │   ├── middlewares/              # errorHandler.js & notFound.js
│   │   ├── routes/                   # health.route.js & index.js
│   │   ├── __tests__/                # Automated node:test suites (health.test.js)
│   │   ├── app.js                    # Express app with helmet, cors, morgan, rateLimit
│   │   └── server.js                 # HTTP + Socket.IO server & graceful shutdown
│   ├── render.yaml                   # Render Web Service deployment blueprint
│   ├── .env.example                  # Environment template
│   ├── .gitignore
│   └── package.json
└── frontend/                         # React 18 + Vite SPA
    ├── src/
    │   ├── components/common/        # Button.jsx, Badge.jsx, Card.jsx
    │   ├── pages/                    # ConnectionTestPage.jsx (live diagnostic console)
    │   ├── services/                 # api.js (Axios) & healthService.js
    │   ├── store/                    # Redux Toolkit store & systemSlice.js
    │   ├── utils/                    # cn.js (twMerge + clsx)
    │   ├── index.css                 # Tailwind directives & Warm Ivory base styles
    │   ├── App.jsx                   # React Router routing
    │   └── main.jsx                  # React DOM mount point & Redux Provider
    ├── index.html                    # Google Fonts & SVG favicon
    ├── tailwind.config.js            # Warm editorial design system tokens
    ├── vercel.json                   # Vercel SPA rewrites & security headers
    ├── vite.config.js                # Vite config & /api proxy to port 5000
    ├── .env.example                  # Environment template
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
# In the root repository directory
npm install
```

### 3. Environment Setup
```bash
# Configure backend environment
cp backend/.env.example backend/.env

# Configure frontend environment
cp frontend/.env.example frontend/.env
```

### 4. Running the Application
```bash
# Start backend API (Port 5000)
npm run dev:backend

# In a separate terminal, start frontend SPA (Port 5173)
npm run dev:frontend
```
- Open [http://localhost:5173](http://localhost:5173) in your browser to view the interactive Infrastructure Diagnostic & Connectivity Console.
- Access the backend health endpoint directly at [http://localhost:5000/api/health](http://localhost:5000/api/health).

### 5. Running Tests & Build Checks
```bash
# Run backend automated unit tests
npm run test:backend

# Run production Vite build check
npm run build:frontend
```

---

## 🚀 Milestone Roadmap

- [x] **Milestone 0: Product Architecture, Design System & System Specifications**
  - [x] Product vision, problem definition & 4 target personas
  - [x] MVP vs. Post-MVP feature matrix
  - [x] C4 container diagrams & layered Express pattern
  - [x] MongoDB Atlas schema definitions & Mermaid ERD
  - [x] 4-tier RBAC matrix & authorization policies
  - [x] RESTful API endpoints & standard JSON envelopes
  - [x] Socket.IO room-based event protocol
  - [x] Warm editorial design system tokens (Plus Jakarta Sans, DM Sans, Terracotta, Sage)
  - [x] Production deployment plan (Vercel, Render, Atlas)
- [x] **Milestone 1: Monorepo Scaffolding, Backend Foundation & Connectivity**
  - [x] Monorepo directory structure (`/frontend`, `/backend`, `/docs`)
  - [x] Node.js + Express backend with helmet, cors, morgan, and rate limiting
  - [x] Standardized error handling and 404 middleware
  - [x] Live backend health endpoint: `GET /api/health`
  - [x] React 18 + Vite frontend with Tailwind CSS warm tokens
  - [x] Redux Toolkit state slice and Axios HTTP client with interceptors
  - [x] Reusable component primitives (`Button`, `Badge`, `Card`)
  - [x] Interactive live frontend-to-backend connection diagnostic page
  - [x] Production deployment configurations (`vercel.json`, `render.yaml`)
  - [x] GitHub Actions CI pipeline (`.github/workflows/ci.yml`)
- [ ] **Milestone 2: Authentication, Workspace Engine & RBAC Implementation**
- [ ] **Milestone 3: Projects, Kanban Boards & Real-Time Socket.IO Synchronization**
- [ ] **Milestone 4: Tasks, Comments, Checklists & Activity Streams**
- [ ] **Milestone 5: Production Deployment, Hardening & End-to-End Verification**
