# Development History

> **Metadata**
>
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
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

**Known Issues Remaining:**
- Next.js 14.2.0 security vulnerability (https://nextjs.org/blog/security-update-2025-12-11) — upgrade pending
- ESLint `react-hooks/exhaustive-deps` warnings in 4 pages
- Deprecated `eslint@8.56.0`, `glob` vuln warnings

**Next Sprint Focus:**
Upgrade Next.js to patched version; fix exhaustive-deps warnings; upgrade ESLint/glob; proceed with Phase 3 secondary features (email, import/export, bulk ops)

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
