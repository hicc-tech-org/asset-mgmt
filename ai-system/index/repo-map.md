# Repo Map

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-23
> - staleness-policy: re-verify if folder structure changes

> **Overview:** Folder structure with purpose of each directory.

---

## Root

```
asset-mgmt/
├── .github/workflows/        # CI/CD pipelines
├── ai-system/                # AI agent documentation & protocols
├── prisma/                   # Database schema & migrations
├── src/                      # Application source code
├── .env.example              # Environment template
├── .gitignore
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs         # ESLint flat config (v9, replaces .eslintrc.js)
├── README.md
├── VERSION                   # Installed AI system version marker
├── MIGRATION.md / V2_TO_V3_MIGRATION.md / CHANGELOG.md
└── cookies.txt               # Dev-only auth cookie dump (ignored in prod)
```

---

## ai-system/

```
ai-system/
├── agents/                   # Agent role definitions
│   ├── architect.md
│   ├── implementer.md
│   ├── reviewer.md
│   ├── tester-qa.md
│   ├── planner.md
│   └── historian.md
├── checkpoints/              # Session state
│   ├── in-progress.md
│   └── session-log.md
├── commands/                 # Agent command definitions
│   ├── audit-drift.md
│   ├── audit-sources.md
│   ├── bootstrap-project.md
│   ├── cloud-session.md
│   ├── dev-cycle.md
│   ├── execute-feature.md
│   ├── fix-build.md
│   ├── generate-design-md.md
│   ├── plan-feature.md
│   ├── pull-template-update.md
│   ├── refactor-codebase.md
│   ├── resume-session.md
│   ├── sync-context.md
│   ├── update-ai-system.md
│   ├── verify-work.md
│   └── visual-review.md
├── design-references/        # External design references
│   ├── README.md
│   └── TEMPLATE/DESIGN.md
├── index/                    # Codebase indexes
│   ├── dependency-graph.md
│   └── repo-map.md
├── memory/                   # Long-term memory
│   ├── architecture-history.md
│   ├── lessons-learned.md
│   └── project-decisions.md
├── planning/                 # Project planning
│   ├── project-plan.md
│   └── task-queue.md
├── protocols/                # Operational protocols
│   ├── context-tiering.md
│   ├── entry-protocol.md
│   ├── escalation-rules.md
│   ├── quality-gate.md
│   └── verification-rules.md
├── skills/                   # Specialized skills
│   ├── acid-transaction-review/
│   ├── design-token-extraction/
│   ├── gh-stack/
│   ├── integration-wrapper-scaffold/
│   ├── lean-debt-audit/
│   ├── pdf-html-asset-inspection/
│   ├── rbac-page-scaffold/
│   ├── research/
│   └── universal-component-check/
├── standards/                # Engineering standards
│   └── engineering-principles.md
├── summaries/                # Development summaries
│   └── dev-history.md
├── testing/                  # Test artifacts
│   ├── test-plan.md
│   └── test-results.md
├── tools/                    # Tool registry
│   ├── integrations/
│   └── registry.md
├── ai-context.md
├── design-system.md
├── project-context.md
├── repair-system.md
└── system-architecture.md
```

---

## prisma/

```
prisma/
├── schema.prisma             # Database schema
├── seed.ts                   # Seed script (idempotent, deseedable, deterministic IDs)
├── deseed.ts                 # Deseed script (removes only seeded rows)
├── seed-manifest.json        # Generated manifest (generated at seed time)
└── migrations/               # Migration history (generated)
```

---

## src/

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts       # POST + GET (GET redirects to /auth/login)
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── assets/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   ├── [id]/route.ts         # GET, PATCH, DELETE
│   │   │   ├── assign/route.ts       # POST assign asset
│   │   │   └── return/route.ts       # POST return asset
│   │   ├── users/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   └── [id]/route.ts         # GET, PATCH, DELETE
│   │   ├── approvals/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   └── [id]/route.ts         # PATCH approve/reject (async params)
│   │   ├── audit-logs/
│   │   │   └── route.ts              # GET with filters
│   │   ├── dashboard/
│   │   │   └── stats/route.ts        # GET dashboard aggregates (counts, recent, pending, byCategory)
│   │   ├── accessories/
│   │   │   ├── route.ts              # GET list, POST create (AccessoryType)
│   │   │   └── [id]/route.ts         # PATCH, DELETE (AccessoryType)
│   │   └── admin/
│   │       ├── configs/route.ts      # GET all, PATCH upsert (SystemConfig)
│   │       ├── import/route.ts       # POST bulk import assets (JSON/CSV parsed client-side)
│   │       └── backup/route.ts       # GET export all data (assets/users/approvals/logs)
│   ├── auth/
│   │   ├── login/page.tsx            # Login page
│   │   └── logout/page.tsx           # Logout (POST /api/auth/logout then redirect)
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard (real stats via /api/dashboard/stats, skeletons, byCategory)
│   ├── assets/
│   │   ├── page.tsx                  # Asset list (TableSkeleton, filters, pagination)
│   │   ├── new/page.tsx              # Create asset (form → POST /api/assets)
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Asset detail (skeleton, auditLogs, accessories)
│   │   │   ├── edit/page.tsx         # Edit asset (PATCH /api/assets/[id])
│   │   │   ├── assign/page.tsx       # Assign asset (POST /api/assets/assign)
│   │   │   └── return/page.tsx       # Return asset (POST /api/assets/return)
│   ├── users/
│   │   ├── page.tsx                  # User list (TableSkeleton, filters, pagination)
│   │   ├── new/page.tsx              # Invite user (POST /api/users)
│   │   └── [id]/page.tsx             # User detail + inline edit (PATCH/DELETE /api/users/[id])
│   ├── approvals/
│   │   └── page.tsx                  # Approvals list (TableSkeleton, approve/reject modal)
│   ├── audit-logs/
│   │   └── page.tsx                  # Audit logs list (TableSkeleton, filters)
│   ├── admin/
│   │   ├── page.tsx                  # Admin panel (editable: AccessoryTypes CRUD + SystemConfig settings via APIs)
│   │   ├── import/page.tsx           # Bulk import (CSV/JSON → POST /api/admin/import)
│   │   ├── backup/page.tsx           # Backup (GET /api/admin/backup → download JSON)
│   │   └── accessories/
│   │       └── new/page.tsx          # Add AccessoryType (POST /api/accessories)
│   ├── globals.css                   # Global styles + Tailwind
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home redirect
├── components/
│   ├── ui/                           # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   └── skeleton.tsx              # Skeleton, TableSkeleton, CardSkeleton, StatsSkeleton (loading UX)
│   ├── forms/                        # Form components (future)
│   ├── tables/                       # Table components (future)
│   └── layout/                       # Layout components
│       ├── sidebar.tsx               # Collapsible (w-64↔w-16), mobile drawer + overlay, signout, localStorage persistence
│       ├── header.tsx                # Minimal top bar (hamburger toggle, user chip, signout) — nav removed (sidebar owns nav)
│       └── dashboard-layout.tsx      # Orchestrates collapsed/mobile state, lg:pl-64/16, passes props to Sidebar/Header
├── lib/                              # Core utilities
│   ├── prisma.ts                     # Prisma client singleton (globalThis guard)
│   ├── auth.ts                       # Auth utilities (bcryptjs + jsonwebtoken, Node runtime; Next 15: async cookies() — setAuthCookie/clearAuthCookie are async)
│   ├── audit.ts                      # Audit logging
│   └── utils.ts                      # Common utilities
├── middleware.ts                     # Edge middleware — MUST use jose (Edge-compatible), not jsonwebtoken/bcryptjs
├── types/                            # TypeScript types (future)
└── hooks/                            # React hooks (future)
```

> **Note:** `src/middleware.ts` is Edge Runtime. It was migrated from `src/lib/auth.ts:verifyToken` (jsonwebtoken) to `jose:jwtVerify` on 2026-09-16 to fix Vercel build warnings (`bcryptjs`/`jsonwebtoken` Node APIs not supported in Edge). `src/lib/auth.ts` remains Node-only for API routes; middleware must stay Edge-compatible.

---

## Key Entry Points

| Purpose | File |
|---------|------|
| App entry | `src/app/layout.tsx` |
| Home page | `src/app/page.tsx` (redirects to /dashboard) |
| Dashboard | `src/app/dashboard/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| Database | `prisma/schema.prisma` |
| Auth (Node) | `src/lib/auth.ts` |
| Auth (Edge) | `src/middleware.ts` (jose) |
| UI components | `src/components/ui/*` |
| Layout | `src/components/layout/dashboard-layout.tsx` |
| Build | `package.json:scripts.build` = `prisma generate && next build`; `postinstall` = `prisma generate` (Vercel cache fix) |
| Lint | `eslint.config.mjs` (flat config, ESLint 9.31, `next/core-web-vitals` via FlatCompat) — replaces `.eslintrc.js` |

## Drift Fixed 2026-09-16

- Build: Added `prisma generate` to `build` and `postinstall` to fix `PrismaClientInitializationError: Prisma has detected that this project was built on Vercel...` observed in Vercel build `iad1` on 2026-09-16 (phase: Collecting page data for /api/approvals/[id]).
- Edge: Middleware migrated to `jose:jwtVerify` (async) — decouples Edge from Node-only `jsonwebtoken`/`bcryptjs`. Previous build emitted warnings for `process.nextTick`, `setImmediate`, `process.version` in Edge Runtime.
- Middleware is async and reads `auth-token` cookie + sets `x-user-*` headers for server components; `await params` pattern used in `src/app/api/approvals/[id]/route.ts` matches Next.js 14/15 async params.

## Drift Fixed 2026-09-16 (follow-up)

- Next.js CVE: Upgraded `next` + `eslint-config-next` from `14.2.0` to `15.5.25` (security update https://nextjs.org/blog/security-update-2025-12-11). Verified Edge `jose` compatibility and `next.config.js` serverActions.
- ESLint/Glob: Upgraded `eslint` `8.56.0` → `9.31.0`, migrated `.eslintrc.js` → `eslint.config.mjs` (flat config, FlatCompat). Glob vuln (`glob@7`/`glob@10` deprecated) removed via eslint 9 tree (`@eslint/config-array`). `next lint` is deprecated in Next 15 — future migration is `eslint .` via `npx @next/codemod next-lint-to-eslint-cli`.
- Exhaustive-deps: Wrapped `fetchApprovals`/`fetchAssets`/`fetchLogs`/`fetchUsers` in `React.useCallback` with explicit deps; `useEffect` now depends on callback — `✔ No ESLint warnings or errors`.
- Next 15 async cookies: `src/lib/auth.ts:setAuthCookie`/`clearAuthCookie` made `async` + `await cookies()`; call sites (`/api/auth/login`, `/register`, `/logout`) now `await` — fixes `Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'` type error introduced by Next 15.

## Drift Fixed 2026-09-23 — Full UX/Routing Remediation

- 404s: Created missing pages that caused `Failed to load resource: 404` for RSC fetches: `assets/new`, `assets/[id]/edit|assign|return`, `users/new`, `users/[id]`, `admin/backup|import|accessories/new`, `auth/logout` (POST+GET `/api/auth/logout` + `/auth/logout` page). Added API aliases: `dashboard/stats`, `accessories`(+[id]), `admin/configs|import|backup`. Verified `next build` 32 routes (previously 21) — all 404s resolved.
- Layout: Removed navbar duplication (Header nav list removed — Sidebar owns nav). Sidebar now collapsible (w-64↔w-16, localStorage `sidebar-collapsed`), mobile drawer with overlay + hamburger in Header toggles `mobileOpen`, close-on-route-change. Signout button in Sidebar (and Header fallback) — POST `/api/auth/logout` then `router.push('/auth/login')`.
- Loading UX: Added `src/components/ui/skeleton.tsx` (Skeleton, TableSkeleton, CardSkeleton, StatsSkeleton). All list pages (`assets`, `users`, `approvals`, `audit-logs`, `dashboard`, `assets/[id]`) show skeletons while `loading` vs immediate empty state; `emptyMessage` clarified (e.g., “No assets found — seed data may be loading or filters exclude results”).
- Dashboard real data: Replaced mock stats/recentAssets/pendingApprovals with `fetch('/api/dashboard/stats')` — aggregates `totalAssets/assigned/available/pendingApprovals/maintenance/retired/totalUsers` + `recentAssets` (5, with assignee) + `pendingApprovals` (5) + `byCategory` groupBy; `formatNumber` for display; error + loading skeletons.
- Admin editable: `admin/page.tsx` now fetches/edits `AccessoryType` via `/api/accessories` (CRUD + inline edit modal, delete) and `SystemConfig` via `/api/admin/configs` (PATCH upsert for `high_value_threshold`, `approval_reminder_days`, `email_notifications_enabled`). Import (`admin/import` → CSV/JSON parse client-side → POST `/api/admin/import` bulk create) and Backup (`admin/backup` → GET `/api/admin/backup` → download JSON) are fully wired.
- Build: `npm run build` passes — `✓ Compiled successfully`, 32 routes, `ƒ Middleware 39 kB`, zero Edge warnings.