# System Architecture

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-29
> - staleness-policy: re-verify before trusting if any architecture-affecting commits have been made since last-verified-against-code

> **Overview:** How the system is structured — layers, modules, data flow, and configuration. Agents designing or changing structure must read this first.

---

## Architecture Diagram

```
Client (Browser)
        ↓
Presentation Layer (Next.js App Router + React Components)
        ↓
API Layer (Next.js Route Handlers)
        ↓
Service Layer (Business Logic in API routes)
        ↓
Data Access Layer (Prisma Client)
        ↓
Data Store (PostgreSQL)
```

---

## Module Breakdown

| Module | Responsibility | Key Files | Dependencies |
|--------|---------------|-----------|--------------|
| Authentication | User auth, sessions, JWT | `src/lib/auth.ts`, `src/app/api/auth/` | bcryptjs, jsonwebtoken, Prisma User model |
| Asset Management | Asset CRUD, assignment, return, accessories | `src/app/api/assets/`, `src/app/assets/` | Prisma Asset model, Audit logging |
| User Management | User CRUD, roles, departments, invitations | `src/app/api/users/`, `src/app/users/` | Prisma User model, Audit logging |
| Approval Workflow | Multi-level approval chains | `src/app/api/approvals/`, `src/app/approvals/` | Prisma Approval model, User/Asset models |
| Audit Logging | Automatic trail for all state changes | `src/lib/audit.ts`, `src/app/api/audit-logs/` | Prisma AuditLog model |
| UI Components | Reusable design system | `src/components/ui/` | Tailwind CSS, Radix UI primitives |
| Layout | Dashboard shell, navigation | `src/components/layout/` | Next.js Link, React Context |

---

## Data Flow

### Standard Request Flow

```
1. Client request → Next.js Middleware (auth check)
2. → API Route Handler (validation, authorization)
3. → Prisma Service (database operations)
4. → Audit Log Creation (automatic)
5. → Response to Client
```

### Authentication Flow

```
1. Login POST /api/auth/login → verify credentials
2. → Generate JWT token → Set HttpOnly cookie
3. → Middleware validates cookie on each request
4. → Decoded payload available in API routes via headers
```

### Asset Assignment Flow

```
1. POST /api/assets/assign { assetId, assigneeId, accessories }
2. → Validate permissions (IT/SuperAdmin only)
3. → Check asset availability
4. → Update asset: assignedToId, assignedById, assignedAt, status
5. → Assign accessories (bulk update)
6. → Create Acknowledgement record (ISSUE type, unsigned)
7. → Create AuditLog (ASSIGN action)
8. → Return updated asset
```

### Approval Flow

```
1. POST /api/approvals { type, assetId, reason }
2. → Build approval chain based on type/asset value
3. → Create Approval record with chain (PENDING)
4. → Set first approver as currentApprover
5. → Approver PATCH /api/approvals/:id { action: approve/reject }
6. → Update chain step status
7. → If approve: move to next approver or mark APPROVED
8. → If reject: mark REJECTED, stop chain
9. → Create AuditLog (APPROVE/REJECT action)
10. → If fully approved: execute approval action (create assignment approval)
```

### Data Persistence Flow

```
All writes go through Prisma Client
→ Transactions used for multi-step operations
→ AuditLog created after successful commit
→ Soft deletes for Users (isActive=false)
→ Hard deletes only for SuperAdmin on Assets
```

---

## Configuration Points

| Config Key | Purpose | Location | Default |
|-----------|---------|----------|---------|
| DATABASE_URL | PostgreSQL connection string | `.env` | Required |
| JWT_SECRET | JWT signing secret | `.env` | Required (min 32 chars) |
| NEXT_PUBLIC_APP_URL | Base URL for links | `.env` | http://localhost:3000 |
| NODE_ENV | Environment mode | `.env` | development |
| high_value_threshold | Asset value requiring Compliance approval | SystemConfig DB | 100000 |
| approval_reminder_days | Days before approval reminder | SystemConfig DB | 3 |
| email_notifications_enabled | Enable email notifications | SystemConfig DB | true |

All config points follow the fallback discipline from `standards/engineering-principles.md` §1 and §3.

---

## Verification CLI (agent-verifiable behavior)

| Command | What it proves | When to use |
|---------|---------------|-------------|
| `npm run typecheck` | TypeScript compiles without errors | Before commit, CI |
| `npm run lint` | Code follows style guidelines | Before commit, CI |
| `npm run db:studio` | Database schema matches Prisma | Schema changes |
| `npm run db:seed` | Seed data creates expected records | Fresh DB setup |

---

## Rollback & Undo (deployment level)

- **Previous-build promotion**: Vercel/Platform automatic rollback to previous deployment
- **DB migration reversibility**: Prisma migrations are not auto-reversible; manual down migrations required for schema changes
- **Feature-flag kill switch**: SystemConfig table stores feature flags (e.g., email_notifications_enabled) that can be toggled without deploy

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js / React | 14 / 18 |
| Backend | Next.js API Routes | 14 |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 5.10 |
| Auth | JWT (HS256) | — |
| Styling | Tailwind CSS | 3.4 |
| Validation | Zod | 3.22 |

---

## Known Constraints & Technical Debt

- No automated tests yet (need to implement test pyramid per §19)
- No email notification service integrated (placeholder in SystemConfig)
- Approval chain building logic is in API route, should be extracted to service
- Asset accessory creation during asset creation needs transaction wrapper
- No file upload for asset images/documents
- No real-time updates (polling only)

---

## Architecture History

See `memory/architecture-history.md` for full chronology.