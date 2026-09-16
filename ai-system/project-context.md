# Project Context

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
> - staleness-policy: re-verify if >10 sessions old or after major scope changes

> **Overview:** Why this project exists, who it serves, and what constraints govern development. Agents should read this to understand the "why" behind the work.

---

## Project Purpose

Asset Management Platform to replace the client's manual Excel/PDF-based asset tracking system. The platform manages the full lifecycle of IT assets (laptops, phones, accessories) with automated approval chains, audit trails, and digital custody acknowledgements. It serves as a centralized system for IT, HR, and Compliance departments to track asset assignments, returns, transfers, and maintenance while maintaining regulatory compliance through comprehensive audit logging.

---

## Target Users

| User Type | Needs | Key Interactions |
|-----------|-------|------------------|
| Super Admin | Full system control, user invitation, department/role management | Invite users, configure system, view all audit logs |
| IT Head / IT Officer | Asset procurement, assignment, maintenance, accessory management | Create assets, assign to employees, manage accessories, approve requests |
| HR Head / HR Officer | Employee onboarding/offboarding, asset issuance approval | Approve asset requests, manage employee records, track assignments |
| Compliance Head / Officer | High-value asset approval, audit compliance, policy enforcement | Approve high-value assets, review audit trails, enforce policies |
| Employee | View assigned assets, request returns, sign acknowledgements | View assets, request returns, sign digital acknowledgements |

---

## Business Constraints

- Must support multi-department approval workflows (HR, IT, Compliance)
- Must maintain complete audit trail for compliance (timestamps, actor, before/after state)
- Must track accessories individually with unique IDs for reassignment
- Must capture digital asset custody acknowledgement statements
- Must support role-based access with department-specific permissions
- Data must remain on-premise or in controlled cloud environment
- Must support Nigerian business context (currency, date formats, locations)

---

## Current Project Phase

Phase: Active Development — MVP core complete; hardening sprints done (2.1 + follow-up)

Active sprint focus: MVP core (Phase 1–2) complete and Vercel-deployable; 2026-09-16 hardening fixed Prisma generate + jose Edge; 2026-09-16 follow-up closed all deep-sync discrepancies (Next.js 15.5.25 CVE fix, eslint 9.31 flat config, exhaustive-deps via useCallback, Next 15 async cookies). Next: Phase 3 secondary features (email, import/export, bulk ops).

---

## Tech Decisions Already Made

| Decision | Reason |
|----------|--------|
| Next.js 15.5.25 App Router | Modern React framework with server components, API routes, and good DX (upgraded from 14.2.0 to fix CVE https://nextjs.org/blog/security-update-2025-12-11; Next 15 keeps React 18.2.0 compat) |
| Prisma ORM | Type-safe database access with excellent TypeScript integration |
| PostgreSQL | Robust relational database for complex relationships and audit trails |
| Tailwind CSS | Utility-first styling with design token support |
| JWT in HttpOnly cookies | Secure authentication without localStorage exposure — Node: jsonwebtoken/bcryptjs; Edge: jose (jwtVerify) — Node cookies API is async in Next 15 (`setAuthCookie`/`clearAuthCookie` await `cookies()`) |
| React Hook Form + Zod | Performant forms with schema validation |
| Custom UI components | Full control over design system, no external dependencies |
| Prisma generate at build | Required on Vercel (`build` + `postinstall`) to avoid cached-client `PrismaClientInitializationError` |
| ESLint 9.31 flat config | `eslint.config.mjs` via FlatCompat (`next/core-web-vitals`), replaces `.eslintrc.js`; fixes glob vuln and exhaustive-deps (useCallback) |

---

## Out of Scope

- Mobile native applications (web-responsive only)
- Advanced reporting/analytics dashboard (basic stats only)
- Integration with external HR/ITSM systems (future phase)
- Barcode/QR code scanning (future phase)
- Multi-tenancy (single organization only)

---

## External Integrations

| Service | Purpose | Auth Method |
|---------|---------|-------------|
| PostgreSQL | Primary data store | Connection string |
| Email (future) | Approval notifications, reminders | SMTP / SendGrid API |