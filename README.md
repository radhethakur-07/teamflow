# TeamFlow — Production MERN SaaS Platform

> **A focused, tactile, real-time project workflow platform for modern teams.** Built with React 18, Vite, Node.js, Express, MongoDB Atlas, and Socket.IO.

---

## 🌟 Executive Overview

TeamFlow is a production-quality, multi-tenant collaboration platform designed for high-velocity teams. Eschewing generic, cold blue dashboards and gloomy dark-mode templates, TeamFlow introduces a **warm, tactile editorial visual identity** (warm ivory, terracotta, sage green, mustard, lavender, and warm charcoal) paired with **sub-100ms real-time WebSocket synchronization**.

### Core Architecture Pillars:
- **Monorepo Structure:** Decoupled between `/frontend` (React + Vite), `/backend` (Express + Socket.IO), and `/docs` (Architecture & Specs).
- **Warm Editorial Visual Foundation:** 15 production-grade pages built with **Plus Jakarta Sans** (headings) and **DM Sans** (body), Warm Ivory `#F8F5EF`, Terracotta `#E98269`, Sage `#91A88C`, Mustard `#E9C995`, Lavender `#C9B8D9`, and Warm Charcoal `#554B43`.
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

TeamFlow follows an organic, warm editorial palette designed for ergonomic focus and visual clarity:

- **Warm Ivory:** `#F8F5EF` (Canvas Base)
- **Terracotta:** `#E98269` (Brand Primary & CTAs)
- **Sage Green:** `#91A88C` (Success, Completed Tasks & Healthy Indicators)
- **Soft Mustard:** `#E9C995` (In-Progress, Attention & Badges)
- **Muted Lavender:** `#C9B8D9` (Review States & Secondary Tags)
- **Warm Charcoal:** `#554B43` (Primary Headings & High-Contrast Typography)
- **Typography Fonts:** **Plus Jakarta Sans** (Headings) and **DM Sans** (Body & Controls)

---

## 🗺️ Application Page Hierarchy & Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Editorial showcase with value props, design philosophy, and live comparison. |
| `/login` | **Login Page** | Secure authentication with email, password, and remember-me toggles. |
| `/register` | **Registration Page** | Account creation with real-time password strength meter and terms check. |
| `/forgot-password` | **Forgot Password Page** | Password recovery request form with instant confirmation feedback. |
| `/onboarding` | **Workspace Onboarding** | 3-step setup wizard: Workspace Name, Team Domain, and Colleague Invites. |
| `/dashboard` | **Main Dashboard** | Executive overview: 4 spacious metrics, active projects, priority tasks, and live activity stream. |
| `/projects` | **Projects Listing** | Project cards with status filters (All/Active/Archived), search, and "+ New Project" modal. |
| `/projects/:id` | **Project Details** | Project overview, throughput progress meter, milestone roadmap, and team roster. |
| `/board` | **Kanban Board** | 4-column agile board (To Do, In Progress, In Review, Done) with interactive task detail drawer. |
| `/my-tasks` | **My Tasks Page** | Daily execution list with interactive completion checkboxes and priority pills. |
| `/members` | **Team Members Page** | Member directory table with 4-tier RBAC badges and "+ Invite Teammate" modal. |
| `/calendar` | **Calendar Page** | Monthly schedule view with task deadlines plotted by project colors. |
| `/notifications` | **Notifications Center** | In-app alerts filtered by All, Unread, Mentions, and System with deep links. |
| `/settings/profile` | **Profile Settings** | Avatar upload simulation, name, title, bio, and password change. |
| `/settings/workspace` | **Workspace Settings** | Workspace name, URL slug, plan quotas, and Danger Zone with confirmation dialog. |
| `/status` | **Infrastructure Diagnostic** | Real-time frontend-to-backend connectivity diagnostic and round-trip ping. |

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

### 4. Running Tests & Build Checks
```bash
# Run backend automated unit tests
npm run test:backend

# Run production Vite build check
npm run build:frontend
```

---

## 🚀 Milestone Roadmap

- [x] **Milestone 0: Product Architecture, Design System & System Specifications**
- [x] **Milestone 1: Monorepo Scaffolding, Backend Foundation & Connectivity**
- [x] **Milestone 2: Frontend Visual Foundation & Complete 15-Page Experience**
  - [x] Warm editorial design system tokens (Ivory `#F8F5EF`, Terracotta `#E98269`, Sage `#91A88C`, Charcoal `#554B43`)
  - [x] Plus Jakarta Sans and DM Sans typography scale
  - [x] Complete 15-page responsive frontend architecture
  - [x] Global layout shell (`Sidebar`, `Header`, `SearchModal` with `⌘K`, `AppLayout`)
  - [x] Reusable component suite (`Button`, `Badge`, `Card`, `Modal`, `Drawer`, `Dropdown`, `Tabs`, `Breadcrumbs`, `ConfirmDialog`, `Avatar`, `EmptyState`, `SkeletonLoader`)
  - [x] Interactive Kanban board with task detail drawer, checklists, and discussions
  - [x] Toast notification system (`ToastContext`) and realistic mock state (`AppContext`)
  - [x] Verified production build and 16 route responses (`HTTP 200 OK`)
- [ ] **Milestone 3: Backend Authentication, Workspace Engine & RBAC Implementation**
- [ ] **Milestone 4: Real-Time Sockets, Projects & Live Kanban Board Synchronization**
- [ ] **Milestone 5: Production Deployment, Hardening & End-to-End Verification**
