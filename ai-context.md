# Project AI Context

> **Metadata**
>
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
> - installed-ai-system-version: 1.0.0
> - staleness-policy: re-verify before trusting if project structure has changed

> **Overview:** Project overview — the very first file any AI agent should read. Provides a 30-second orientation to what this project is, what stack it uses, and where to find everything.

---

## Quick Reference

| Field            | Value                             |
| ---------------- | --------------------------------- |
| Project Name     | Asset Management Platform         |
| Type             | Web Application                   |
| Primary Language | TypeScript                        |
| Frontend         | Next.js 14 (App Router)           |
| Backend          | Next.js API Routes + Prisma       |
| Database         | PostgreSQL                        |
| Styling          | Tailwind CSS                      |
| Deployment       | Vercel / Docker                   |

---

## Key Modules

| Module           | Location                    | Purpose                                       |
| ---------------- | --------------------------- | --------------------------------------------- |
| Authentication (Node) | `src/lib/auth.ts`      | JWT auth (jsonwebtoken/bcryptjs), session management (Node runtime) |
| Edge Auth        | `src/middleware.ts`         | JWT verify via `jose:jwtVerify` (Edge Runtime, async) |
| Database         | `src/lib/prisma.ts`         | Prisma client singleton (requires `prisma generate` at build) |
| Audit Logging    | `src/lib/audit.ts`          | Automatic audit trail for state changes       |
| Asset Management | `src/app/api/assets/`       | Asset CRUD, assignment, return, accessories   |
| User Management  | `src/app/api/users/`        | User CRUD, roles, departments, invitations    |
| Approvals        | `src/app/api/approvals/`    | Multi-level approval workflows                |
| Audit Logs       | `src/app/api/audit-logs/`   | Compliance audit trail retrieval              |
| UI Components    | `src/components/ui/`        | Reusable design system components             |
| Layout           | `src/components/layout/`    | Dashboard layout, sidebar, header             |

---

## Entry Point

The AI system documentation lives in `ai-system/`.

Start with: `ai-system/protocols/entry-protocol.md`

Two catalogs worth knowing exist (read on demand, not up front):
- Skills catalog: `ai-system/skills/README.md` (Tier 3 — load a skill's `SKILL.md` when its trigger matches)
- Tool/resource registry: `ai-system/tools/registry.md` (Tier 3 — check before doing by hand what a registered tool does)

---

## Active Development Focus

Building the MVP of an Asset Management Platform to replace manual Excel/PDF-based tracking. Core features: asset lifecycle management, accessory tracking with unique IDs, multi-department approval chains (HR, IT, Compliance), comprehensive audit trails, and role-based access control with Superadmin user invitation capabilities.

> **2026-09-16 update:** MVP core complete and Vercel-deployable after build hardening (PR #5): `build` now `prisma generate && next build` + `postinstall` `prisma generate`; Edge middleware migrated to `jose` (async). Open debt: Next.js 14.2.0 CVE upgrade, `exhaustive-deps` lint fixes, eslint/glob upgrades — see `ai-system/system-architecture.md` Discrepancy Report and `ai-system/planning/task-queue.md` Sprint 2.1.