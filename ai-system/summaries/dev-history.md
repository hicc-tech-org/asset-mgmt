# Development History

> **Metadata**
>
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-23
> - staleness-policy: historical entries do not go stale

> **Overview:** Chronological log of completed development work. Each sprint ends with a summary entry. Agents add entries after completing tasks. Useful for understanding what has been built, when decisions were made, and what patterns have emerged.

---

## Entry Format

```
## [Date] — [Sprint or Session Title]

**Summary:**
[2-4 sentence overview of what was accomplished]

**Completed:**
- [task 1]
- [task 2]

**Key Changes:**
- [important architectural or behavioural change]

**Next Sprint Focus:**
[What comes next]
```

---

## History

---

## 2026-08-29 — Project Initialization & MVP Bootstrap

**Summary:**
Complete project bootstrap and MVP core implementation covering all Phase 1–2 features. Established full-stack foundation with Next.js 14, Prisma, PostgreSQL, and Tailwind CSS.

**Completed:**
- ai-system directory created with all template files (agents, commands, protocols, skills, tools, testing)
- Comprehensive Prisma schema: User (roles/departments/hierarchy), Asset (accessories via self-relation, accessoryId), Approval (dynamic chain), AuditLog (polymorphic), Acknowledgement, AssetTransfer, AccessoryType, SystemConfig
- Authentication: JWT + bcrypt + HttpOnly cookies + middleware
- Base UI library: Button, Input, Card, Badge, Table, Select, Textarea, Tabs
- Dashboard layout (Sidebar, Header, DashboardLayout)
- All API routes: auth (login/logout/me/register), assets (CRUD + assign + return), users (CRUD), approvals (CRUD + chain progression), audit-logs (filtered retrieval)
- All main pages: login, dashboard, assets (list/detail), users, approvals, audit-logs, admin panel
- Seed script with realistic data derived from `ai-system/artifacts/IT_Asset_Register copy.xlsx` and `Asset Issuance Form.pdf`
- Comprehensive AI system docs: project-context, system-architecture, design-system, project-plan, task-queue, repo-map, dependency-graph, architecture-history, lessons-learned, test-plan
- ~60 files created, initial commit `813341d`

**Key Changes:**
- Initial MVP encompassing approval chains (HR→IT→Compliance), accessory tracking with unique IDs, audit trails (timestamps/actor/entity), superadmin invitations with department/privilege
- Patterns: config-driven (SystemConfig), RBAC, ACID transactions, universal components

**Next Sprint Focus:**
Install dependencies, configure database, run seed, verify functionality, address Vercel deployment

---

## 2026-09-16 — Build Hardening & Vercel Deploy Fix

**Summary:**
Fixed Vercel production build that failed during `Collecting page data` with `PrismaClientInitializationError` and Edge Runtime incompatibilities. Two atomic fixes applied and deployed via PR #5.

**Completed:**
- Fix 1 — Prisma Vercel build: Added `prisma generate && next build` to `package.json:scripts.build` and `prisma generate` to `postinstall` (per https://pris.ly/d/vercel-build). Resolves cached-deps outdated Prisma Client error affecting all `/api/approvals/[id]` data collection.
- Fix 2 — Edge Runtime auth: Migrated `src/middleware.ts` from `src/lib/auth.ts:verifyToken` (jsonwebtoken/bcryptjs) to `jose:jwtVerify` (Edge-compatible, async). Eliminates compiled warnings: `process.nextTick`, `setImmediate`, `process.version` not supported in Edge Runtime. Middleware now async, sets `x-user-*` headers.
- Added `jose@5.6.3` dependency (parity with `jsonwebtoken` HS256)
- Verified via Vercel build log `iad1 09:42` — warnings removed, `✓ Compiled successfully`, remaining `Linting` warnings only

**Key Changes:**
- Build pipeline now Vercel-aware (prisma generate prerequisite)
- Edge/Node runtime boundary explicitly separated: middleware (Edge+jose) vs API routes (Node+jsonwebtoken/bcryptjs)
- Docs synchronized: `index/repo-map.md` and `index/dependency-graph.md` updated to reflect Edge split; `system-architecture.md` tech stack and verification CLI updated; `planning/project-plan.md` + `task-queue.md` record hardening sprint

**Known Issues Remaining:** (resolved in follow-up 2026-09-16)
- Next.js 14.2.0 security vulnerability — resolved via 15.5.25 upgrade
- ESLint `react-hooks/exhaustive-deps` warnings — resolved via useCallback
- Deprecated `eslint@8.56.0`, `glob` vuln warnings — resolved via eslint 9.31 flat config

**Next Sprint Focus:**
Proceed with Phase 3 secondary features (email, import/export, bulk ops)

---

## 2026-09-16 — Next.js 15 / ESLint 9 Upgrade & Exhaustive-Deps Fix (follow-up)

**Summary:**
Completed remaining discrepancies flagged in the 2026-09-16 deep sync: upgraded Next.js CVE, fixed `react-hooks/exhaustive-deps`, and migrated ESLint/glob to remove deprecation vulns. Also handled Next 15 breaking change (`cookies()` async).

**Completed:**
- Next.js 14.2.0 → 15.5.25 (`next` + `eslint-config-next` 15.5.25, CVE https://nextjs.org/blog/security-update-2025-12-11); verified Edge middleware (`jose`) and `next.config.js` compatibility
- ESLint 8.56.0 → 9.31.0; migrated `.eslintrc.js` → `eslint.config.mjs` (flat config via `FlatCompat`, `next/core-web-vitals`); glob `@humanwhocodes/*` + `glob@7`/`glob@10` vulns removed via eslint 9 tree; `next lint` deprecated warning noted (future: `npx @next/codemod next-lint-to-eslint-cli`)
- Fixed `react-hooks/exhaustive-deps` in 4 pages: `src/app/approvals/page.tsx:65`, `src/app/assets/page.tsx:66`, `src/app/audit-logs/page.tsx:61`, `src/app/users/page.tsx:66` — wrapped `fetch*` in `React.useCallback` with explicit deps, `useEffect` now on `[fetch*]`; lint: `✔ No ESLint warnings or errors`
- Next 15 async cookies: `src/lib/auth.ts:setAuthCookie`/`clearAuthCookie` made `async` + `await cookies()`, call sites `src/app/api/auth/login`, `register`, `logout` now `await` — fixes type error `Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'`
- Build verified: `npm run typecheck` pass, `npm run lint` pass, `npm run build` (`prisma generate && next build`) → `✓ Compiled successfully`, 21 pages, `ƒ Middleware 39 kB`, no Edge warnings
- Docs deep-synced: `system-architecture.md` (Tech Stack 15.5.25, discrepancy report, debt), `index/repo-map.md` (eslint.config.mjs, async auth note), `index/dependency-graph.md` (runtime/build/dev versions, hook deps), `planning/project-plan.md` + `task-queue.md` (T050-T052 ✅), `memory/architecture-history.md`, `memory/lessons-learned.md`, `repair-system.md` updated

**Key Changes:**
- Framework major minor bump 14→15 (React 18.2.0 retained, compatible); lint major bump 8→9 flat config; auth cookie API breaking change handled
- Discrepancy report fully closed except low-priority follow-ups (`next lint` CLI migration, Prisma 5→8 major)

**Next Sprint Focus:**
Phase 3 secondary features; add CI `npm run build` gate + `npm audit` check per lessons-learned action items

---

## 2026-09-23 — Full UX/Routing Remediation (404s, Layout, Skeletons, Dashboard, Admin)

**Summary:**
Resolved all user-reported discrepancies from the `execute-feature` directive: missing add/edit/import/invite pages (11 × 404 RSC), redundant navbar + broken hamburger + static sidebar, empty states without skeletons, mock dashboard, and read-only admin. Implemented non-breaking additive changes; verified via `prisma generate && next build` (32 routes, `✓ Compiled successfully`).

**Completed:**
- 404 fixes: Created `assets/new` (POST /api/assets), `assets/[id]/edit` (PATCH), `assets/[id]/assign` (POST /api/assets/assign), `assets/[id]/return` (POST /api/assets/return), `users/new` (POST /api/users), `users/[id]` (GET/PATCH/DELETE inline edit), `admin/import` (CSV/JSON → POST /api/admin/import), `admin/backup` (GET /api/admin/backup → download), `admin/accessories/new` (POST /api/accessories), `auth/logout` (POST+GET /api/auth/logout + page). Added APIs: `dashboard/stats` (counts + groupBy), `accessories` + `[id]`, `admin/configs`, `admin/import`, `admin/backup`, `auth/logout GET` redirect.
- Layout: Sidebar collapsible (w-64↔w-16, `localStorage sidebar-collapsed`), mobile drawer with `mobileOpen` + overlay + close-on-route-change, Header hamburger toggles drawer, navbar duplicated list removed from Header (Sidebar owns nav), signout button in Sidebar (and Header fallback) via `POST /api/auth/logout` → `router.push('/auth/login')`. DashboardLayout orchestrates `collapsed`/`mobileOpen` and applies `lg:pl-64` vs `lg:pl-16`.
- Loading UX: New `src/components/ui/skeleton.tsx` (`Skeleton`, `TableSkeleton`, `CardSkeleton`, `StatsSkeleton`). All list pages (`assets`, `users`, `approvals`, `audit-logs`) gate `DataTable` behind `loading ? TableSkeleton`; `assets/[id]` shows `Skeleton` stack; dashboard shows `StatsSkeleton`/`Skeleton` during fetch. Empty messages clarified for filtered/seed states.
- Dashboard real data: Replaced mocks with `fetch('/api/dashboard/stats')` → `stats{totalAssets, assigned, available, pendingApprovals, maintenance, retired, totalUsers}`, `recentAssets` (5 with assignee), `pendingApprovals` (5 with requester/asset), `byCategory` groupBy; `formatNumber` applied; error handling; no more `Failed to fetch assets: TypeError` (follows same auth cookie pattern).
- Admin editable: `admin/page.tsx` now fetches `AccessoryType` via `/api/accessories` (list, inline edit modal PATCH /api/accessories/[id], DELETE) and `SystemConfig` via `/api/admin/configs` (GET all, PATCH upsert for `high_value_threshold`, `approval_reminder_days`, `email_notifications_enabled`). Import handles CSV/JSON client parse → bulk POST; backup generates + downloads JSON.
- Build verified: `npx prisma generate` + `npm run build` → `✓ Compiled successfully`, 32 routes, middleware 39kB, zero Edge warnings, no 404s. See `ai-system/index/repo-map.md` 2026-09-23 drift notes and `system-architecture.md` discrepancy report.

**Key Changes:**
- Route count 21→32; new `skeleton.tsx` primitive; layout state lift to `DashboardLayout`; real stats API; admin evolves from static to CRUD.

**Next Sprint Focus:**
- Wire import to handle accessory columns + validation; add Excel export; add CI build gate + `npm audit`; consider `prisma.$transaction` for bulk import atomicity.

---

## 2026-09-23 — Query Sync, Assignment Edit, Departments/Roles CRUD, Preview-As-Role

**Summary:**
Implemented follow-up directive: query params in location/navbar now drive filtering, admin can edit asset assignments via Selects with audit, departments/roles/perm scopes are end-to-end CRUD non-breaking, and SUPERADMIN can preview as any role without sign-out. Build passes (35 routes).

**Completed:**
- Query param filtering: `assets/page.tsx` (`?status&?category&?search&?department`), `users/page.tsx` (`?department&?role&?search`), `approvals/page.tsx` (`?status&?type`), `audit-logs/page.tsx` (`?entityType&?action&?actorId`) now read `useSearchParams` inside `Suspense` + `useRouter`/`usePathname` to sync `router.replace` on filter change; debounced search (400ms) + pagination `?page`; `admin` department cards linking to `/users?department=HR` now correctly filter.
- Assignment edit (admin): Extended `assets/[id]/edit` with Assignment section (Select assignee from `GET /api/users?pageSize=100` + `expectedReturnDate`), submit logic: unassign via `PATCH assignedToId=null` (audit UNASSIGN) or reassign via `POST /api/assets/assign` (creates `AssetTransfer`, audit TRANSFER). Updated `POST /api/assets/assign` to allow reassignment (remove “already assigned” block, create `AssetTransfer` + audit TRANSFER with metadata) and `PATCH /api/assets/[id]` to detect assignment delta and audit TRANSFER/UNASSIGN/ASSIGN vs generic UPDATE. All audit-logged.
- Departments/Roles CRUD (non-breaking): Created `/api/admin/departments` + `/api/admin/roles` backed by `SystemConfig` (`category=department|role`, `key=dept_*|role_*`); GET merges enum fallback (8 depts, 9 roles) + configs; POST creates new config; PATCH updates or creates override for enum edit; DELETE removes config (enum delete blocked). `admin/page.tsx` now 6 tabs (adds Preview); Departments tab full CRUD table + add/edit form, Roles tab full CRUD with department/permission fields, all audit-logged.
- Preview as: New `POST|DELETE|GET /api/admin/preview` manages `preview-role` cookie (SUPERADMIN only); `src/middleware.ts` overrides `x-user-role` + sets `x-preview-role`/`x-real-role` when cookie present and real role SUPERADMIN; `Sidebar` (`baseNavigation` with roles array) filters nav by `previewRole` cookie and shows purple preview banner with Exit; `admin/page.tsx` Preview tab selector + Exit + links to Dashboard/Assets.
- Build verified: `prisma generate && next build` → `✓ Compiled successfully` (35 routes now: + departments, roles, preview), `ƒ Middleware 39.1 kB`, no Edge warnings, `✔ No ESLint warnings` except one `searchParams` dep note (benign).

**Key Changes:**
- Route count 32→35; `Sidebar` nav now role-filtered via `baseNavigation` roles array; `middleware` preview override; `assets/[id]/edit` now Select-driven reassignment; SystemConfig reused for extensible department/role definitions without schema migration.

**Next Sprint Focus:**
- Add CI `npm run build` gate + smoke test for `?department` filtered links; evaluate `prisma.$transaction` for department/role + asset bulk atomicity; add `npm audit` check.

---

## [DATE] — Project Initialization — Template (retain)

**Summary:**
Project repository created and ai-system documentation structure initialized. Bootstrap prompt run to establish initial architecture understanding. Task queue populated with first sprint tasks.

**Completed:**

- ai-system directory created with all template files
- Initial project scan completed

**Key Changes:**

- None yet — project start

**Next Sprint Focus:**
Begin first development tasks from task-queue.md
