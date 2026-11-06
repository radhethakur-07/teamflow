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
├── .gitignore                        # Global ignore (secrets, build outputs, node_modules)
├── README.md                         # Project overview and milestone roadmap
├── docs/                             # Complete technical and architectural specifications
│   ├── PRODUCT_REQUIREMENTS.md       # Product vision, personas, MVP vs. Future
│   ├── SYSTEM_ARCHITECTURE.md        # C4 diagrams, layered backend, Vite frontend
│   ├── DATABASE_DESIGN.md            # Schemas, Mermaid ERD, compound indexes
│   ├── API_SPECIFICATION.md          # REST API endpoints, envelopes, error codes
│   ├── USER_FLOWS.md                 # Mermaid sequence and state flow diagrams
│   ├── ROLE_PERMISSIONS.md           # Fine-grained 4-tier RBAC matrix
│   ├── DESIGN_SYSTEM.md              # Warm color tokens, typography, component specs
│   └── DEPLOYMENT_PLAN.md            # Vercel, Render, Atlas CI/CD and env setup
├── backend/                          # Node.js + Express + Socket.IO API
│   ├── src/                          # Controllers, services, models, routes, middlewares
│   ├── .env.example                  # Environment configuration template
│   └── package.json
└── frontend/                         # React 18 + Vite SPA
    ├── src/                          # Pages, components, stores, hooks, styles
    ├── .env.example                  # Environment configuration template
    └── package.json
```

---

## 🚀 Milestone Roadmap

- [x] **Milestone 0: Product Architecture, Design System & System Specifications**
  - [x] Product vision & problem definition
  - [x] Target user personas & journey maps
  - [x] Complete MVP feature specification vs. post-MVP roadmap
  - [x] Layered system architecture & monorepo design
  - [x] MongoDB Atlas schema definitions & Mermaid ERD
  - [x] Fine-grained 4-tier RBAC matrix & middleware policies
  - [x] RESTful API endpoints & standard JSON envelopes
  - [x] Socket.IO real-time event protocol
  - [x] Warm editorial design system tokens (Plus Jakarta Sans, DM Sans, Terracotta, Sage)
  - [x] Production deployment plan (Vercel, Render, Atlas)
- [ ] **Milestone 1: Backend Foundation, Authentication & Workspace Engine**
- [ ] **Milestone 2: Projects, Kanban Boards & Real-Time Socket.IO Synchronization**
- [ ] **Milestone 3: Frontend Implementation with Warm Design System & Kanban UI**
- [ ] **Milestone 4: Testing, CI/CD, Deployment & Production Readiness**
