# ⚡ VoltaPay — High-Performance Digital Wallet & Webhook Gateway

VoltaPay is a production-ready, full-stack digital wallet and payment gateway platform configured as a high-performance **Turborepo monorepo**. It simulates a complete fintech flow—including user onboarding, P2P transactions, split-billing, dynamic QR code generation, database seeding, and secure bank callback webhooks.

---

## 🏛️ System Architecture & Data Flow

```mermaid
sequenceDiagram
    actor User as User App (Next.js)
    participant DB as PostgreSQL (Prisma)
    participant Webhook as Bank Webhook (Express)

    User->>DB: Initiate On-Ramp Transaction (Generate Token)
    User->>Webhook: Simulates Bank Success (Send Token + Amount)
    Note over Webhook,DB: Runs DB transaction (Locks records)
    Webhook->>DB: Update Transaction Status to "Success"
    Webhook->>DB: Increment User Wallet Balance (Atomic update)
    Webhook-->>User: Captured Status (Reflects in User UI)
```

---

## 🛡️ Technical Highlights (For Engineering Recruiters)

This repository demonstrates advanced full-stack and DevOps engineering practices:

*   **Monorepo Workspace Linking**: Powered by **Turborepo** and **NPM Workspaces**. Code is shared seamlessly across the client and API backend with zero-publish local symlinking.
*   **Atomic Database Transactions**: Implements Prisma’s transactional API (`$transaction`) in the bank webhook to execute multi-table updates (incrementing user balance and updating transaction tokens) atomically, preventing race conditions and keeping financial records mathematically sound.
*   **Production Docker Orchestration**: Utilizes a highly optimized, multi-stage Docker build pipeline. Docker Compose spins up PostgreSQL, runs migrations, seeds testing profiles, and links backend/frontend servers in a secure virtual network.
*   **Decoupled State Management**: Uses Recoil in `user-app` for performant, selector-based state propagation of volatile interface metrics like balance counters and MPin verification parameters.
*   **CI/CD Pipeline Verification**: Contains a pre-configured GitHub Actions pipeline (.github/workflows/ci.yml) that verifies type compliance, ESLint conformity, and builds Docker containers automatically on every branch update.

---

## 🗂️ Project Structure

```
├── apps/
│   ├── user-app/            # Next.js 14 Web Portal (Client & Server Actions)
│   └── bank-webhook/        # Express.js Server (Simulated Bank Webhook Capture)
├── packages/
│   ├── db/                  # Shared database schema, Prisma client & seeding configurations
│   ├── store/               # Shared Recoil atom structures and custom hooks
│   ├── ui/                  # Tailored React component library
│   ├── eslint-config/       # Unified code styling configuration
│   └── typescript-config/   # Unified tsconfig definitions
```

---

## ⚡ Quick Start (Local Run)

### 1. Installation
Run at the root directory to install all monorepo dependencies:
```bash
npm install
```

### 2. Setup Environment Configuration
Create a `.env` file under `packages/db/`:
```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
```

And under `apps/user-app/`:
```env
JWT_SECRET="test"
NEXTAUTH_URL="http://localhost:3001"
```

### 3. Database Migration & Mock Data
Generate types, run migrations, and seed mock profiles:
```bash
# Generate client types & run PostgreSQL migrations
npx prisma migrate dev --schema=packages/db/prisma/schema.prisma

# Load seed configurations (Bob & Alice profiles)
npx prisma db seed --schema=packages/db/prisma/schema.prisma
```

### 4. Boot Dev Environments
Run the entire stack in development watch-mode:
```bash
npm run dev
```
- **User Dashboard**: http://localhost:3001
- **Bank Webhook Listener**: http://localhost:3003

- **Mock Logins (see `packages/db/prisma/seed.ts`)**:
  - Alice: Phone `1111111111` | Password `alice`
  - Bob: Phone `2222222222` | Password `bob`

---

## 🐳 Containerized Deployment (Docker Compose)

Start the entire development ecosystem in isolated container environments:
```bash
docker compose up --build
```
This orchestrates:
1. **`db`**: A PostgreSQL 15 database instance.
2. **`db-setup`**: A temporary base image task runner that performs automated schema deployments (`prisma migrate deploy`) and executes DB seeding.
3. **`user-app`**: Next.js runner mapped to `localhost:3001`.
4. **`bank-webhook`**: Express webhook listener mapped to `localhost:3003`.

To stop the services:
```bash
docker compose down -v
```

---

## 🔌 Simulating a Bank On-Ramp Event

To mock a payment gateway sending transaction capture confirmations (e.g., from HDFC bank), execute this webhook call:

```bash
curl -X POST http://localhost:3003/hdfcWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token__1",
    "user_identifier": "1",
    "amount": "50000"
  }'
```
*Note: The amount parameter is parsed in Paisa (`50000` Paisa = `500` INR).*