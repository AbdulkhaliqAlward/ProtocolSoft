# ProtocolSoft

A modern, high-performance web platform and enterprise Content Management System (CMS) for **ProtocolSoft**.

---

## 🏗️ Architecture & Monorepo Overview

This repository is structured as a high-performance monorepo:

```
protocol_soft_webApp/
├── apps/
│   ├── cms/          # Payload CMS (v3) - Headless CMS & Admin Portal
│   └── web/          # Next.js Frontend - Marketing & Client Platform
├── packages/
│   ├── shared/       # Shared TypeScript types, schemas, and helpers
│   └── ui/           # Shared UI component library
├── docs/             # Technical architecture and design documentation
├── scripts/          # Automation and database seed scripts
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## 🚀 Tech Stack

- **Frontend (`apps/web`)**: Next.js (App Router), React, Tailwind CSS / Vanilla CSS Design System, Lucide Icons
- **Backend / CMS (`apps/cms`)**: Payload CMS v3, Next.js, Postgres / SQLite DB Adapter
- **Language**: TypeScript across all apps and packages
- **Internationalization (i18n)**: Native bilingual support for Arabic (`ar`) and English (`en`)
- **Deployment & Infra**: Docker, Docker Compose, Caddy Reverse Proxy

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (Optional, for containerized local execution)

### 1. Installation

Install all workspace dependencies from the root directory:

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment files:

```bash
cp .env.example .env
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env
```

Configure your environment variables in `.env` and `apps/cms/.env` accordingly.

### 3. Running Locally

You can start the development servers for both apps concurrently:

```bash
# Start all apps
npm run dev

# Or start specific applications
npm run dev:web   # Frontend at http://localhost:3000
npm run dev:cms   # CMS Admin at http://localhost:3001
```

### 4. Running with Docker Compose

To build and run the entire stack using Docker:

```bash
docker compose up -d --build
```

---

## 📄 Documentation

For in-depth architectural design, strategy, and verification reports, explore the [`docs/`](./docs) folder:
- [Phase 1: Strategy & Brand Identity](./docs/PHASE_1_STRATEGY.md)
- [Phase 2: CMS Architecture & Data Modeling](./docs/PHASE_2_CMS_ARCHITECTURE.md)
- [Phase 3: Design System & UI/UX](./docs/PHASE_3_DESIGN_SYSTEM_UI_UX.md)
- [Phase 5: Visual Rebuild & System Report](./docs/PHASE_5_VISUAL_REBUILD_REPORT.md)

---

## 🔒 Security & Best Practices

- Environment secrets and credentials must never be committed to source control.
- Rate limiting, CSRF protections, and internal API security headers are enabled for all cross-service communication.
