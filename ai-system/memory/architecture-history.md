# Architecture History

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-29
> - staleness-policy: append-only, never remove entries

> **Overview:** Chronological record of significant architectural decisions and changes.

---

## 2026-08-29 — Initial Architecture (Bootstrap)

**Decision**: Initialize Asset Management Platform with Next.js 14, Prisma, PostgreSQL, Tailwind CSS

**Context**: Fresh project bootstrap to replace manual Excel/PDF asset tracking for client.

**Alternatives Considered**:
- Express.js + separate frontend — Rejected: Next.js provides unified full-stack with better DX
- MongoDB — Rejected: Relational data (users, assets, approvals, audit logs) needs ACID and relationships
- Supabase — Rejected: Client wants self-hosted PostgreSQL control
- Chakra UI / Material UI — Rejected: Custom design system with Tailwind gives more control

**Outcome**: Established baseline architecture with:
- Next.js App Router for unified frontend/backend
- Prisma ORM for type-safe database access
- JWT in HttpOnly cookies for authentication
- Tailwind CSS with custom design tokens
- Role-based access control (RBAC) via middleware
- Automatic audit logging for all state changes
- Multi-level approval chains (HR → IT → Compliance)

**Models Created**:
- User (with roles, departments, hierarchy)
- Asset (with categories, status, accessories)
- Approval (with dynamic chains)
- AuditLog (polymorphic, comprehensive)
- Acknowledgement (digital signatures)
- AssetTransfer (for transfer history)
- AccessoryType (catalog)
- SystemConfig (feature flags)

**Patterns Established**:
- Config-driven over hardcoded (SystemConfig table)
- Metadata-driven structure (roles, departments as enums)
- RBAC via universal pages (single route, role-based rendering)
- ACID-aware operations (Prisma transactions for multi-step)
- Universal component catalog (Button, Input, Card, Table, Badge, Select, Textarea, Tabs)
- Audit trails on all mutations
- Soft deletes for users, hard deletes for assets (SuperAdmin only)

---

## Future Entries

*Add new entries here as architecture evolves*