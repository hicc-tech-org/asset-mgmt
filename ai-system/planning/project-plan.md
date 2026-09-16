# Project Plan

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
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

- [ ] Email notifications for approvals and assignments
- [ ] Asset import from Excel/CSV
- [ ] Asset export to Excel/PDF
- [ ] Bulk asset operations
- [ ] Asset maintenance scheduling
- [ ] Asset transfer between employees
- [ ] Dashboard widgets customization
- [ ] Advanced search and saved filters
- [ ] Asset depreciation tracking
- [ ] Warranty expiry alerts

---

## Phase 3.5 — Build & Deploy Hardening (Added 2026-09-16)

- [x] Fix Vercel build: add `prisma generate` to `build` + `postinstall` (PrismaClientInitializationError)
- [x] Fix Edge Runtime: migrate `src/middleware.ts` to `jose:jwtVerify` (remove bcryptjs/jsonwebtoken Node APIs from Edge)
- [ ] Upgrade Next.js 14.2.0 to patched version (security vulnerability https://nextjs.org/blog/security-update-2025-12-11)
- [ ] Fix ESLint warnings: `react-hooks/exhaustive-deps` in approvals/assets/audit-logs/users pages
- [ ] Upgrade ESLint 8.56 + glob deprecations

---

## Phase 4 — Quality & Polish

- [ ] Unit test coverage for core modules (lib, API routes)
- [ ] Integration tests for critical paths (assignment, approval, return)
- [ ] E2E tests for main user flows
- [ ] Performance audit and optimization
- [ ] Accessibility audit (WCAG AA)
- [ ] Error states and loading states complete
- [ ] Responsive design verification
- [ ] Dark mode support

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
- [x] UI component library
- [x] Vercel deploy fix (Prisma generate) — 2026-09-16
- [x] Edge middleware fix (jose) — 2026-09-16