# System Architecture

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-23
> - staleness-policy: re-verify before trusting if any architecture-affecting commits have been made since last-verified-against-code
> - notable-update: 2026-09-23 full UX/routing remediation (collapsible sidebar, skeletons, dashboard real stats, import/backup, admin editable, 32 routes)

> **Overview:** How the system is structured — layers, modules, data flow, and configuration. Agents designing or changing structure must read this first.

---

## Architecture Diagram

```
Client (Browser)
        ↓
Edge Middleware (src/middleware.ts — jose jwtVerify, Edge Runtime)
        ↓
Presentation Layer (Next.js App Router + React Components)
        ↓
API Layer (Next.js Route Handlers — Node Runtime)
        ↓
Service Layer (Business Logic in API routes)
        ↓
Data Access Layer (Prisma Client — requires prisma generate at build)
        ↓
Data Store (PostgreSQL)
```

> **Edge/Node boundary (updated 2026-09-16):** Middleware runs on Edge Runtime and uses `jose` for JWT verification. All API routes and `src/lib/auth.ts` (bcryptjs/jsonwebtoken) run on Node runtime. Do not import Node-only modules into middleware.

---

## Module Breakdown

| Module | Responsibility | Key Files | Dependencies |
|--------|---------------|-----------|--------------|
| Authentication (Node) | User auth, sessions, JWT (API routes) | `src/lib/auth.ts`, `src/app/api/auth/` | bcryptjs, jsonwebtoken, Prisma User model |
| Edge Auth | Request gating, JWT verify in Edge | `src/middleware.ts` | jose (jwtVerify), Next.js Edge Runtime — no bcryptjs/jsonwebtoken |
| Asset Management | Asset CRUD, assignment, return, accessories, bulk import | `src/app/api/assets/`, `src/app/assets/`, `src/app/api/admin/import` | Prisma Asset model, Audit logging |
| User Management | User CRUD, roles, departments, invitations | `src/app/api/users/`, `src/app/users/` | Prisma User model, Audit logging |
| Approval Workflow | Multi-level approval chains | `src/app/api/approvals/`, `src/app/approvals/` | Prisma Approval model, User/Asset models |
| Audit Logging | Automatic trail for all state changes | `src/lib/audit.ts`, `src/app/api/audit-logs/` | Prisma AuditLog model |
| Dashboard | Real aggregates, byCategory, recent assets, pending approvals | `src/app/api/dashboard/stats`, `src/app/dashboard/` | Prisma groupBy/count, formatNumber |
| Admin Config | Accessory types, system settings, backup | `src/app/api/accessories`, `src/app/api/admin/configs|backup|import` | Prisma AccessoryType, SystemConfig |
| UI Components | Reusable design system + skeletons | `src/components/ui/` (incl. skeleton.tsx) | Tailwind CSS, Radix UI primitives |
| Layout | Collapsible dashboard shell, mobile drawer | `src/components/layout/` (Sidebar collapsible + overlay, Header minimal) | Next.js Link, React state + localStorage |

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
1. Login POST /api/auth/login → verify credentials (bcryptjs + jsonwebtoken, Node)
2. → Generate JWT token → Set HttpOnly cookie (next/headers)
3. → Middleware (Edge, jose:jwtVerify) validates cookie on each request, async
4. → Decoded payload injected as x-user-* headers for API routes
5. → API routes use src/lib/auth.ts:verifyToken (Node) for direct cookie fallback where needed
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
| JWT_SECRET | JWT signing secret (shared Node+Edge; Edge reads via TextEncoder) | `.env` | Required (min 32 chars) |
| NEXT_PUBLIC_APP_URL | Base URL for links | `.env` | http://localhost:3000 |
| NODE_ENV | Environment mode | `.env` | development |
| high_value_threshold | Asset value requiring Compliance approval | SystemConfig DB | 100000 |
| approval_reminder_days | Days before approval reminder | SystemConfig DB | 3 |
| email_notifications_enabled | Enable email notifications | SystemConfig DB | true |

Build-related config (added 2026-09-16):

| Config Key | Purpose | Location | Default |
|-----------|---------|----------|---------|
| `build` script | Ensures Prisma client generated on Vercel cached builds | `package.json` | `prisma generate && next build` |
| `postinstall` script | Ensures client generated on `npm install` (Vercel, local) | `package.json` | `prisma generate` |

All config points follow the fallback discipline from `standards/engineering-principles.md` §1 and §3.

---

## Verification CLI (agent-verifiable behavior)

| Command | What it proves | When to use |
|---------|---------------|-------------|
| `npm run typecheck` | TypeScript compiles without errors | Before commit, CI |
| `npm run lint` | Code follows style guidelines | Before commit, CI |
| `npm run build` | Build succeeds with Edge-compatible middleware + generated Prisma client | Before deploy (mimics Vercel) |
| `npm run db:generate` | Prisma client generated (required before build) | After schema changes, CI |
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
| Frontend | Next.js / React | 15.5.25 / 18.2.0 |
| Backend | Next.js API Routes | 15.5.25 |
| Database | PostgreSQL | 14+ |
| ORM | Prisma | 5.10.0 |
| Auth (Node) | jsonwebtoken (HS256) + bcryptjs | 9.0.2 / 2.4.3 |
| Auth (Edge) | jose jwtVerify | 5.6.3 |
| Styling | Tailwind CSS | 3.4 |
| Validation | Zod | 3.22 |
| Lint | ESLint (flat config) | 9.31.0 (eslint-config-next 15.5.25, FlatCompat) |

> **Version pin drift resolved 2026-09-16:** Next.js upgraded from 14.2.0 (CVE https://nextjs.org/blog/security-update-2025-12-11) to 15.5.25. ESLint migrated from 8.56 legacy (.eslintrc.js) to 9.31 flat config (eslint.config.mjs). Glob vuln removed via eslint 9 dependency tree.

---

## Known Constraints & Technical Debt

- No automated tests yet (need to implement test pyramid per §19)
- No email notification service integrated (placeholder in SystemConfig — `email_notifications_enabled` flag wired but no sender)
- Approval chain building logic is in API route, should be extracted to service
- Asset accessory creation during asset creation needs transaction wrapper
- No file upload for asset images/documents
- No real-time updates (polling only)
- `next@15.5.25` uses `eslint@9.31.0` via FlatCompat; `next lint` is deprecated in Next 15 (use `eslint .` via `npx @next/codemod next-lint-to-eslint-cli` for future CLI migration)
- `src/lib/auth.ts` now async cookies API (Next 15 `cookies()` returns Promise) — `setAuthCookie`/`clearAuthCookie` are async and must be awaited in route handlers
- Import bulk creation loops without transaction — partial success tracked via `results` array but not atomic; consider `prisma.$transaction` for all-or-nothing mode

---

## Discrepancy Report (2026-09-16 deep sync — follow-up)

| Area | Finding | Severity | Action |
|------|---------|----------|--------|
| Build | `prisma generate` missing from build → Vercel `PrismaClientInitializationError` on `Collecting page data` | High — fixed (2026-09-16) | Added to `build` + `postinstall` |
| Edge Runtime | `src/middleware.ts` imported `src/lib/auth.ts` (jsonwebtoken/bcryptjs) → Edge warnings `process.nextTick`/`setImmediate`/`process.version` | High — fixed (2026-09-16) | Migrated middleware to `jose` (Edge-compatible), made `middleware` async |
| Security | `next@14.2.0` security vulnerability (npm warn, 2025-12-11 blog) | High — fixed (2026-09-16) | Upgraded `next` + `eslint-config-next` to `15.5.25`; re-verified `middleware` matcher & `jose` compatibility; `next.config.js` serverActions still valid |
| Lint | `react-hooks/exhaustive-deps` warnings in `approvals/assets/audit-logs/users` pages (`fetch*` missing dep) | Low — fixed (2026-09-16) | Wrapped fetchers in `React.useCallback` with explicit deps; `useEffect` now depends on `fetch*` callback — lint passes with zero warnings |
| ESLint/Glob deprecations | `@humanwhocodes/*` deprecated, `glob@7`/`glob@10` vuln warnings, `eslint@8.56.0` unsupported | Medium — fixed (2026-09-16) | Upgraded `eslint` to `9.31.0`, `eslint-config-next` to `15.5.25`; migrated `.eslintrc.js` → `eslint.config.mjs` (FlatCompat, flat config); glob vuln removed (eslint 9 uses `@eslint/config-array` + `@eslint/eslintrc`) |
| Cookies API | Next 15 `cookies()` async breaking change | Medium — fixed (2026-09-16) | `src/lib/auth.ts:setAuthCookie`/`clearAuthCookie` made `async` + `await cookies()`; call sites (`/api/auth/login`, `/register`, `/logout`) now `await` |
| Config | `next.config.js` lacks `prisma` generate awareness | Fixed | Documented via `package.json` scripts |
| Docs | `repo-map.md`/`dependency-graph.md` stale wrt Edge split and build | Fixed | Updated in this sync and follow-up sync |
| Remaining | `next lint` deprecated in Next 15; `prisma@5.10.0` update available (8.0.0-rc) | Low — open | Migrate lint script to `eslint .` via `npx @next/codemod@canary next-lint-to-eslint-cli` when ready; evaluate Prisma 6/8 major upgrade separately |

## Discrepancy Report (2026-09-23 deep sync)

| Area | Finding | Severity | Action |
|------|---------|----------|--------|
| Routing 404s | Missing pages caused RSC 404s: `assets/new`, `assets/[id]/edit|assign|return`, `users/new|/[id]`, `admin/backup|import|accessories/new`, `auth/logout`, `api/assets/new` (client used wrong path), `users/*`, `admin/*` | High — fixed (2026-09-23) | Created 11 pages + 6 API routes (`dashboard/stats`, `accessories`, `admin/configs|import|backup`, `auth/logout GET`); `next build` 32 routes vs 21, no 404s |
| Layout | Sidebar not collapsible, no signout, redundant Header navbar, hamburger no-op (`Failed to fetch assets`, mobile unusable) | High — fixed (2026-09-23) | Sidebar collapsible + mobile drawer + overlay + localStorage, Header minimal (hamburger toggles mobileOpen), signout in both, DashboardLayout orchestrates `collapsed`/`mobileOpen` |
| Data visibility | Pages showed “No assets/users” despite seed, no loading state, dashboard mock numbers | High — fixed (2026-09-23) | Added `skeleton.tsx`, all list pages gate DataTable behind `loading ? TableSkeleton`, dashboard fetches real aggregates via `/api/dashboard/stats` (`groupBy` counts, formatted) |
| Admin read-only | Admin tabs static, no edit for accessory types or settings | Medium — fixed (2026-09-23) | Admin now CRUDs AccessoryType via `/api/accessories` (edit modal, delete) and SystemConfig via `/api/admin/configs` (PATCH upsert) ; import/backup wired |
| Add/Edit/Import/Invite | No forms for asset creation, user invite, bulk import | Medium — fixed (2026-09-23) | Built `assets/new`, `assets/[id]/edit`, `users/new`, `admin/import` (CSV/JSON bulk), `admin/accessories/new` — all validated, audit-logged |

---

## Architecture History

See `memory/architecture-history.md` for full chronology.