# TeamFlow — Production Deployment & DevOps Plan

**Document Version:** 1.0.0  
**Status:** Approved for Milestone 0  
**DevOps & Infrastructure Architect:** Senior DevOps & Cloud Infrastructure Engineer  

---

## 1. Cloud Architecture Overview

TeamFlow is architected for cloud-native zero-maintenance deployment utilizing managed PaaS and DBaaS providers:
- **Frontend SPA:** Deployed on **Vercel** with worldwide CDN distribution, automatic HTTPS, and instant preview builds.
- **Backend API & WebSockets:** Deployed on **Render** as a managed Web Service running Node.js with native WebSocket upgrade support.
- **Database:** Hosted on **MongoDB Atlas** with automated failover, daily snapshots, and encrypted storage.

```mermaid
flowchart LR
    subgraph Users ["Client Browsers"]
        Browser["User Browser / Mobile"]
    end

    subgraph VercelEdge ["Vercel Edge Platform"]
        VercelCDN["Global Anycast CDN"]
        SPABundle["React 18 Production Bundle (dist)"]
        VercelCDN --- SPABundle
    end

    subgraph RenderPlatform ["Render Cloud (Oregon / Frankfurt)"]
        RenderLB["Render Cloud Proxy / WSS Upgrader"]
        NodeCluster["Node.js Express + Socket.IO Web Service"]
        RenderLB --- NodeCluster
    end

    subgraph AtlasCloud ["MongoDB Atlas Cloud (AWS / GCP)"]
        MongoPrimary[("MongoDB Atlas Primary Replica")]
    end

    Browser -->|1. Fetch HTML/JS/Assets| VercelCDN
    Browser -->|2. REST API Requests (HTTPS)| RenderLB
    Browser <-->|3. Live WebSocket Stream (WSS)| RenderLB
    NodeCluster <-->|4. Mongoose Connection Pool| MongoPrimary
```

---

## 2. Environment Variables & Secret Management

In strict accordance with the non-negotiable security requirements, **no secrets or credentials are ever committed to Git**.

### 2.1 Backend Environment Template (`backend/.env.example`)
```ini
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/teamflow?retryWrites=true&w=majority

# JWT Authentication Secrets (Generate with `openssl rand -hex 64`)
JWT_ACCESS_SECRET=your_super_secret_access_key_min_64_chars_length_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_64_chars_length_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS & Client Integration
FRONTEND_URL=https://teamflow.vercel.app
CORS_ORIGIN=https://teamflow.vercel.app,http://localhost:5173
```

### 2.2 Frontend Environment Template (`frontend/.env.example`)
```ini
# Production Backend API URL
VITE_API_URL=https://teamflow-backend.onrender.com/api/v1

# Real-time WebSocket Gateway URL
VITE_SOCKET_URL=https://teamflow-backend.onrender.com
```

---

## 3. Deployment Configuration Specifications

### 3.1 Frontend on Vercel
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Single Page Application (SPA) Routing Configuration (`frontend/vercel.json`):
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

### 3.2 Backend on Render
- **Environment:** Node
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node src/server.js`
- **Health Check Path:** `/api/v1/health`
- **Auto-Deploy:** Yes (On push to `main` branch)

#### WebSocket Compatibility on Render:
- Socket.IO is configured with both `websocket` and `polling` transports:
  ```javascript
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000
  });
  ```
- Render terminates TLS and forwards the `Upgrade: websocket` header seamlessly to the Node.js process.

---

### 3.3 Database on MongoDB Atlas
1. **Cluster Tier:** M0 Sandbox (Development/Staging) &rarr; M10 / Serverless (Production).
2. **Database Access:** Dedicated user `teamflow-app-user` created with `readWrite` permissions scoped strictly to the `teamflow` database.
3. **Network Access / IP Whitelist:** 
   - Render dynamically provisions outgoing IP addresses across cloud providers; set Atlas Network Access to allow `0.0.0.0/0` (secured via SCRAM-SHA-256 database user authentication and strong password).
4. **Connection Pooling:** Configured in Mongoose with `maxPoolSize: 20` and `minPoolSize: 5` to optimize connection reuse.

---

## 4. Continuous Integration Pipeline (GitHub Actions)

A continuous integration workflow validates all pull requests and commits before deployment.

### `.github/workflows/ci.yml` Blueprint:
```yaml
name: TeamFlow CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  backend-test-and-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: 'backend/package.json'

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run Backend Syntax and Lint Check
        working-directory: ./backend
        run: npm run lint --if-present

  frontend-build-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: 'frontend/package.json'

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run Production Vite Build
        working-directory: ./frontend
        run: npm run build
```

---

## 5. Health Monitoring, Cold-Start Handling & Rollbacks

1. **Cold Start Management:** Free tiers on Render sleep after 15 minutes of inactivity. TeamFlow includes:
   - A dedicated `/api/v1/health` endpoint returning database connection status and server uptime.
   - Frontend retry and friendly warm loader screen notifying users during initial server spin-up.
2. **Zero-Downtime Rollbacks:**
   - **Vercel:** Rollback to any previous Git deployment with a single click in the Vercel dashboard.
   - **Render:** Rollback to any previous commit build instantly via Render's deploy history.
3. **Automated Backups:** MongoDB Atlas automated point-in-time snapshots enabled with 7-day retention.

---

## 6. Pre-Flight Deployment Checklist

- [ ] MongoDB Atlas cluster provisioned, database user created, and connection string verified.
- [ ] Render Web Service created with root directory set to `backend`.
- [ ] Backend environment variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`) configured in Render.
- [ ] Vercel Project linked to GitHub repo with root directory set to `frontend`.
- [ ] Frontend environment variables (`VITE_API_URL`, `VITE_SOCKET_URL`) configured in Vercel.
- [ ] Health check endpoint `/api/v1/health` verified returning `{ status: "healthy", database: "connected" }`.
- [ ] CORS tested and confirmed between Vercel production domain and Render API.
- [ ] WebSocket connection handshake tested with real-time room events.
