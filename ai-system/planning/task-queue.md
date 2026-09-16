# Task Queue

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
> - staleness-policy: update after each sprint or when priorities shift

> **Overview:** Granular, sprint-level tasks derived from `project-plan.md`. Tasks are ordered by priority and dependency.

---

## Sprint 1 — Foundation (Completed 2026-08-29)

| ID | Task | Status | Assignee | Notes |
|----|------|--------|----------|-------|
| T001 | Initialize Next.js project with TypeScript | ✅ Done | — | Package.json, tsconfig, next.config |
| T002 | Configure Tailwind CSS with design tokens | ✅ Done | — | Primary color palette, responsive breakpoints |
| T003 | Set up Prisma schema with all models | ✅ Done | — | User, Asset, Approval, AuditLog, Acknowledgement, AccessoryType, SystemConfig |
| T004 | Create Prisma client singleton | ✅ Done | — | `src/lib/prisma.ts` |
| T005 | Implement authentication (JWT, bcrypt, middleware) | ✅ Done | — | Login, logout, session, route protection |
| T006 | Build base UI components | ✅ Done | — | Button, Input, Card, Badge, Table, Select, Textarea, Tabs |
| T007 | Create dashboard layout (sidebar, header) | ✅ Done | — | Responsive, dark mode ready |
| T008 | Implement audit logging utility | ✅ Done | — | Automatic audit trail for state changes |
| T009 | Create database seed script | ✅ Done | — | Superadmin, dept heads, officers, sample assets |

---

## Sprint 2 — Core Features (Completed 2026-08-29)

| ID | Task | Status | Assignee | Notes |
|----|------|--------|----------|-------|
| T010 | Asset CRUD API routes | ✅ Done | — | GET/POST /api/assets, GET/PATCH/DELETE /api/assets/:id |
| T011 | Asset listing page with filters/pagination | ✅ Done | — | Search, status filter, category filter |
| T012 | Asset detail page with audit trail | ✅ Done | — | Shows assignment, accessories, audit logs, acknowledgements |
| T013 | Asset assignment API and workflow | ✅ Done | — | POST /api/assets/assign with accessory handling |
| T014 | Asset return API and workflow | ✅ Done | — | POST /api/assets/return with condition tracking |
| T015 | User management API routes | ✅ Done | — | GET/POST /api/users, GET/PATCH/DELETE /api/users/:id |
| T016 | User listing page with filters | ✅ Done | — | Department, role, search filters |
| T017 | Approval workflow API | ✅ Done | — | GET/POST /api/approvals, PATCH /api/approvals/:id |
| T018 | Approval chain builder (HR→IT→Compliance) | ✅ Done | — | Dynamic based on type and asset value |
| T019 | Approval listing page with actions | ✅ Done | — | Approve/reject buttons for pending items |
| T020 | Audit logs API with filtering | ✅ Done | — | GET /api/audit-logs with entity/type/actor/date filters |
| T021 | Audit logs page | ✅ Done | — | Paginated table with all filter options |
| T022 | Acknowledgement capture (issue/return) | ✅ Done | — | Digital statements with signature tracking |
| T023 | Dashboard with stats and recent activity | ✅ Done | — | Asset counts, pending approvals, recent assets |
| T024 | Admin panel with tabs | ✅ Done | — | Overview, Departments, Roles, Accessories, Settings |

---

## Sprint 3 — Polish & Secondary Features

| ID | Task | Status | Assignee | Notes |
|----|------|--------|----------|-------|
| T025 | Email notification service integration | ⏳ Pending | — | SendGrid/SMTP for approval reminders |
| T026 | Asset import from Excel/CSV | ⏳ Pending | — | Parse uploaded files, validate, create assets |
| T027 | Asset export to Excel/PDF | ⏳ Pending | — | Generate reports with filters |
| T028 | Bulk asset operations (assign, return, retire) | ⏳ Pending | — | Checkbox selection, bulk actions |
| T029 | Asset transfer workflow | ⏳ Pending | — | Transfer between employees with approval |
| T030 | Asset maintenance scheduling | ⏳ Pending | — | Schedule, track, notify |
| T031 | Warranty expiry alerts | ⏳ Pending | — | Background job, notifications |
| T032 | Advanced search with saved filters | ⏳ Pending | — | Query builder, save/load filters |

---

## Sprint 4 — Quality & Testing

| ID | Task | Status | Assignee | Notes |
|----|------|--------|----------|-------|
| T033 | Unit tests for lib utilities | ⏳ Pending | — | auth, audit, utils |
| T034 | Unit tests for API routes | ⏳ Pending | — | Test with mocked Prisma |
| T035 | Integration tests for assignment flow | ⏳ Pending | — | Test DB, full flow |
| T036 | Integration tests for approval flow | ⏳ Pending | — | Test DB, full chain |
| T037 | E2E tests with Playwright | ⏳ Pending | — | Login, dashboard, asset CRUD |
| T038 | Accessibility audit | ⏳ Pending | — | axe-core, manual testing |
| T039 | Performance audit | ⏳ Pending | — | Lighthouse, bundle analysis |
| T040 | Error boundary and loading states | ⏳ Pending | — | Skeleton loaders, error UI |

---

## Sprint 2.1 — Build Hardening (Completed 2026-09-16)

| ID | Task | Status | Assignee | Notes |
|----|------|--------|----------|-------|
| T048 | Fix Vercel Prisma build (prisma generate) | ✅ Done | fix-build | `build`: `prisma generate && next build`, `postinstall`: `prisma generate`; fixes `PrismaClientInitializationError` |
| T049 | Fix Edge Runtime auth (jose) | ✅ Done | fix-build | Migrated `src/middleware.ts` to `jose:jwtVerify` (async), decouples Edge from bcryptjs/jsonwebtoken |
| T050 | Upgrade Next.js 14.2.0 (CVE) | ✅ Done | update-ai-system | Upgraded `next` + `eslint-config-next` to `15.5.25` (CVE https://nextjs.org/blog/security-update-2025-12-11); handled async cookies API |
| T051 | Fix ESLint exhaustive-deps warnings | ✅ Done | update-ai-system | Wrapped fetchers in `React.useCallback`; `useEffect` now depends on callback — lint `✔ No warnings` |
| T052 | Upgrade ESLint/glob deprecations | ✅ Done | update-ai-system | `eslint` `8.56.0` → `9.31.0`, `.eslintrc.js` → `eslint.config.mjs` (FlatCompat flat config); glob vuln removed |

---

## Sprint 5 — Launch Prep

| ID | Task | Status | Assignee | Notes |
|----|------|--------|----------|-------|
| T041 | Production Docker configuration | ⏳ Pending | — | Multi-stage build, health checks |
| T042 | Security audit | ⏳ Pending | — | Dependencies, auth, input validation (includes Next.js CVE) |
| T043 | API documentation (OpenAPI) | ⏳ Pending | — | Swagger/OpenAPI spec |
| T044 | User documentation | ⏳ Pending | — | Admin guide, user guide |
| T045 | Deployment pipeline | ✅ Partial | — | Vercel build fixed; GitHub Actions → Vercel works |
| T046 | Monitoring setup | ⏳ Pending | — | Sentry, uptime monitoring |
| T047 | Backup strategy | ⏳ Pending | — | Automated DB backups, restore test |

---

## Backlog / Future

| ID | Task | Priority | Notes |
|----|------|----------|-------|
| B001 | Mobile app (React Native) | Low | Share API layer |
| B002 | Barcode/QR code scanning | Medium | Asset tagging, mobile |
| B003 | Multi-tenancy | Low | SaaS offering |
| B004 | Advanced analytics dashboard | Medium | Charts, trends, forecasting |
| B005 | Integration with HRIS/ITSM | Medium | Workday, ServiceNow, etc. |
| B006 | Asset reservation/booking | Low | Meeting rooms, shared devices |
| B007 | Offline-first PWA | Low | Service workers, IndexedDB |