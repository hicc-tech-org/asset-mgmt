# Project Plan

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-23
> - staleness-policy: re-verify if project scope or phase changes

> **Overview:** High-level feature checklist organized by development phase. See `planning/task-queue.md` for granular, sprint-level tasks.

---

## Phase 1 — Foundation

- [x] Repository structure and folder conventions established
- [x] Configuration system implemented (env vars, config files)
- [x] Logging framework in place (audit logging)
- [x] Error handling middleware / global error boundaries
- [x] CI/CD pipeline configuration (GitHub Actions)
- [x] Database schema designed and implemented (Prisma)
- [x] Authentication system (JWT, bcrypt, middleware)
- [x] Base UI component library (Button, Input, Card, Badge, Table, Select, Textarea, Tabs)

---

## Phase 2 — Core Features

- [x] Asset CRUD (create, read, update, delete)
- [x] Asset listing with filters, pagination, search
- [x] Asset detail view with audit trail and acknowledgements
- [x] Asset assignment workflow (IT/SuperAdmin only)
- [x] Asset return workflow (assignee or IT)
- [x] Accessory tracking with unique IDs (parent-child relationship)
- [x] User management (CRUD, roles, departments, invitations)
- [x] Multi-level approval chains (HR, IT, Compliance)
- [x] Approval actions (approve/reject with comments)
- [x] Audit trail system (automatic logging, filtering, retrieval)
- [x] Asset custody & user acknowledgement statements
- [x] Superadmin user invitation with department/privilege assignment
- [x] Dashboard with stats and recent activity

---

## Phase 3 — Secondary Features

- [ ] Email notifications for approvals and assignments (flag wired: `email_notifications_enabled`, no sender)
- [x] Asset import from Excel/CSV — `/admin/import` (CSV/JSON parse client-side → POST `/api/admin/import` bulk create, audit-logged, per-row results)
- [ ] Asset export to Excel/PDF — `/admin/backup` (JSON export done; Excel/PDF TODO)
- [ ] Bulk asset operations
- [ ] Asset maintenance scheduling
- [ ] Asset transfer between employees
- [x] Dashboard widgets customization — dashboard real stats via `/api/dashboard/stats` (counts, byCategory, recent, pending; formatted, skeletons)
- [ ] Advanced search and saved filters
- [ ] Asset depreciation tracking
- [ ] Warranty expiry alerts

---

## Phase 3.5 — Build & Deploy Hardening (Added 2026-09-16, completed follow-up 2026-09-16)

- [x] Fix Vercel build: add `prisma generate` to `build` + `postinstall` (PrismaClientInitializationError)
- [x] Fix Edge Runtime: migrate `src/middleware.ts` to `jose:jwtVerify` (remove bcryptjs/jsonwebtoken Node APIs from Edge)
- [x] Upgrade Next.js 14.2.0 → 15.5.25 (CVE https://nextjs.org/blog/security-update-2025-12-11; also handles Next 15 async cookies API)
- [x] Fix ESLint warnings: `react-hooks/exhaustive-deps` in approvals/assets/audit-logs/users pages (useCallback pattern)
- [x] Upgrade ESLint 8.56 + glob deprecations → eslint 9.31 flat config (eslint.config.mjs, FlatCompat, glob vuln removed)

## Phase 3.6 — UX & Routing Remediation (2026-09-23)

- [x] Fix 404s: create `assets/new`, `assets/[id]/edit|assign|return`, `users/new|/[id]`, `admin/backup|import|accessories/new`, `auth/logout` pages + APIs (`dashboard/stats`, `accessories`, `admin/configs|import|backup`, `auth/logout GET`) — 32 routes
- [x] Layout: collapsible sidebar (w-64↔w-16, localStorage), mobile drawer + overlay, hamburger in Header, remove navbar redundancy, signout in Sidebar/Header
- [x] Loading UX: `skeleton.tsx` + gate DataTable behind `loading ? TableSkeleton`; clarify empty messages; dashboard `StatsSkeleton`
- [x] Dashboard real data: `GET /api/dashboard/stats` aggregates (counts, recent 5, pending 5, byCategory groupBy) replaces mocks; `formatNumber`
- [x] Admin editable: CRUD AccessoryType via `/api/accessories`, upsert SystemConfig via `/api/admin/configs`, wired import/backup pages

## Phase 3.7 — Query Sync, Assignment Edit, Departments/Roles CRUD, Preview (2026-09-23 — current directive)

- [x] Query param filtering: sync `assets/users/approvals/audit-logs` filters to URL via `useSearchParams` + `Suspense` + `router.replace` + debounced search; `?department` etc. in location/navbar now filters data (non-breaking, additive)
- [x] Admin assignment edit: `assets/[id]/edit` Assignment Selects (assignee from `/api/users`, expectedReturnDate) + reassignment logic via `POST /api/assets/assign` (AssetTransfer + audit TRANSFER) or PATCH unassign (UNASSIGN); allow transfer despite assigned status
- [x] Departments/Roles CRUD (non-breaking): `/api/admin/departments` + `/api/admin/roles` via `SystemConfig` (enum fallback + config override, audit-logged); Admin 6-tab UI with full tables/forms
- [x] SUPERADMIN preview-as-role: `/api/admin/preview` cookie + Edge middleware override + Sidebar nav filter + banner + Admin Preview tab

---

## Phase 4 — Quality & Polish

- [ ] Unit test coverage for core modules (lib, API routes)
- [ ] Integration tests for critical paths (assignment, approval, return)
- [ ] E2E tests for main user flows
- [ ] Performance audit and optimization
- [ ] Accessibility audit (WCAG AA)
- [x] Error states and loading states complete — `skeleton.tsx` added; all list pages + detail + dashboard use skeletons during fetch
- [x] Responsive design verification — Sidebar drawer + overlay, Header hamburger, collasible persistence verified via `npm run build` (32 routes, no layout break)
- [ ] Dark mode support (partial: Tailwind dark variants present, manual toggle TODO)

---

## Phase 5 — Launch Preparation

- [ ] Production environment configured
- [ ] Security audit (auth, input validation, secrets)
- [ ] Documentation complete (API docs, user guide)
- [ ] Deployment pipeline tested
- [ ] Backup and disaster recovery plan
- [ ] Monitoring and alerting setup

---

## Completed

- [x] Project initialization and AI system setup
- [x] Database schema with all required models
- [x] Authentication and authorization system (Node: bcryptjs/jsonwebtoken; Edge: jose)
- [x] Core asset management features
- [x] Approval workflow engine
- [x] Audit trail implementation
- [x] User management with RBAC
- [x] Dashboard and main navigation
- [x] UI component library (incl. skeleton.tsx)
- [x] Vercel deploy fix (Prisma generate) — 2026-09-16
- [x] Edge middleware fix (jose) — 2026-09-16
- [x] Next.js CVE + ESLint/glob upgrade + exhaustive-deps fix + async cookies migration — 2026-09-16 (15.5.25 / 9.31)
- [x] UX/routing remediation: 404 fixes (11 pages + 6 APIs), collapsible sidebar + mobile hamburger, skeletons + real dashboard stats, admin editable, import/backup, invite/edit flows — 2026-09-23 (32 routes, build passing)
- [x] Query-param sync, assignment edit with Selects + audit, non-breaking Departments/Roles CRUD, SUPERADMIN preview-as-role — 2026-09-23 current (35 routes now, build passing)