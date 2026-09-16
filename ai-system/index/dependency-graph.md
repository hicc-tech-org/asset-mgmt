# Dependency Graph

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
> - staleness-policy: re-verify after significant architectural changes

> **Overview:** Module relationships as text diagram.

---

## High-Level Dependencies

```
src/app (pages & API routes)
    │
    ├──→ src/components/layout/DashboardLayout
    │       ├──→ src/components/layout/Sidebar
    │       └──→ src/components/layout/Header
    │
    ├──→ src/components/ui/* (Button, Input, Card, Badge, Table, Select, Textarea, Tabs)
    │
    ├──→ src/lib/prisma.ts (Prisma Client)
    │       └──→ @prisma/client
    │
    ├──→ src/lib/auth.ts (Node runtime only)
    │       ├──→ bcryptjs
    │       ├──→ jsonwebtoken
    │       └──→ next/headers (cookies)
    │
    ├──→ src/middleware.ts (Edge Runtime — isolated)
    │       └──→ jose (jwtVerify) — Edge-compatible, no bcryptjs/jsonwebtoken
    │
    ├──→ src/lib/audit.ts
    │       └──→ src/lib/prisma.ts
    │
    └──→ src/lib/utils.ts
            ├──→ clsx
            ├──→ tailwind-merge
            ├──→ date-fns
            └──→ lucide-react
```

> **Edge/Node split (drift fixed 2026-09-16):** `src/middleware.ts` no longer imports `src/lib/auth.ts`. Previous import caused Edge warnings (`process.nextTick`, `setImmediate`, `process.version`). `src/lib/auth.ts` stays Node-only; middleware uses `jose` independently with shared `JWT_SECRET` env.

---

## API Route Dependencies

```
src/app/api/auth/login/route.ts
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts (verifyPassword, generateToken, setAuthCookie)
    └──→ @prisma/client (User)

src/app/api/auth/me/route.ts
    ├──→ src/lib/auth.ts (verifyToken)
    └──→ src/lib/prisma.ts

src/app/api/assets/route.ts (GET, POST)
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts (verifyToken via middleware headers)
    ├──→ src/lib/audit.ts (createAuditLog)
    └──→ @prisma/client (Asset, User)

src/app/api/assets/[id]/route.ts (GET, PATCH, DELETE)
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts
    ├──→ src/lib/audit.ts
    └──→ @prisma/client (Asset, User)

src/app/api/assets/assign/route.ts
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts
    ├──→ src/lib/audit.ts
    └──→ @prisma/client (Asset, User, Acknowledgement)

src/app/api/assets/return/route.ts
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts
    ├──→ src/lib/audit.ts
    └──→ @prisma/client (Asset, User, Acknowledgement)

src/app/api/users/route.ts (GET, POST)
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts (hashPassword)
    ├──→ src/lib/audit.ts
    └──→ @prisma/client (User)

src/app/api/users/[id]/route.ts (GET, PATCH, DELETE)
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts
    ├──→ src/lib/audit.ts
    └──→ @prisma/client (User)

src/app/api/approvals/route.ts (GET, POST)
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts
    ├──→ src/lib/audit.ts
    └──→ @prisma/client (Approval, User, Asset)

src/app/api/approvals/[id]/route.ts (PATCH)
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts (verifyToken Node) + Prisma.Json handling
    ├──→ src/lib/audit.ts
    └──→ @prisma/client (Approval, User, Asset, Acknowledgement)

src/middleware.ts (Edge, async)
    ├──→ jose (jwtVerify)
    ├──→ next/server (NextRequest, NextResponse)
    └──→ env:JWT_SECRET (TextEncoder-encoded key, shared with src/lib/auth.ts)
    └──→ Sets x-user-* headers for API routes; publicPaths: /auth/login, /auth/register, /api/auth


src/app/api/audit-logs/route.ts (GET)
    ├──→ src/lib/prisma.ts
    ├──→ src/lib/auth.ts
    └──→ @prisma/client (AuditLog, User)
```

---

## Prisma Model Dependencies

```
User
    ├──→ Asset (assignedTo) — many
    ├──→ Asset (assignedBy) — many
    ├──→ Asset (createdBy) — many
    ├──→ Approval (requester) — many
    ├──→ Approval (currentApprover) — many
    ├──→ AuditLog (actor) — many
    ├──→ Acknowledgement (user) — many
    ├──→ User (supervisor) — self-ref many
    ├──→ User (subordinates) — self-ref many
    └──→ User (invitedBy/invitedUsers) — self-ref many

Asset
    ├──→ User (assignedTo) — one
    ├──→ User (assignedBy) — one
    ├──→ User (createdBy) — one
    ├──→ Asset (parentAsset) — self-ref one (accessories)
    ├──→ Asset (accessories) — self-ref many
    ├──→ Approval — many
    ├──→ AuditLog — many
    ├──→ Acknowledgement — many
    └──→ AssetTransfer — many

Approval
    ├──→ User (requester) — one
    ├──→ User (currentApprover) — one
    ├──→ Asset — one (optional)
    └──→ AuditLog — implicit via action

AuditLog
    ├──→ User (actor) — one
    └──→ (entityType, entityId) — polymorphic

Acknowledgement
    ├──→ User (user) — one
    ├──→ User (witness) — one (optional)
    └──→ Asset — one

AssetTransfer
    ├──→ Asset — one
    ├──→ User (fromUser) — one (optional)
    ├──→ User (toUser) — one
    └──→ User (approvedBy) — one (optional)

AccessoryType
    └──→ (referenced by Asset.category for accessories)

SystemConfig
    └──→ (standalone key-value store)
```

---

## UI Component Dependencies

```
DashboardLayout
    ├──→ Sidebar
    │       └──→ Link (next/link), Icon (inline SVG)
    │
    └──→ Header
            └──→ Link, Button

DataTable
    ├──→ Badge
    └──→ Button (pagination)

AssetDetailPage
    ├──→ Card, CardHeader, CardTitle, CardContent
    ├──→ Badge
    ├──→ Button
    ├──→ Link
    └──→ formatDate, formatDateTime, getAssetStatusLabel (lib/utils)

AssetsPage
    ├──→ Card, CardContent
    ├──→ Button, Input, Select
    ├──→ DataTable
    ├──→ Badge
    ├──→ Link
    └──→ getAssetStatusLabel

UsersPage
    ├──→ Card, CardContent
    ├──→ Button, Input, Select
    ├──→ DataTable
    ├──→ Badge
    ├──→ Link
    └──→ getRoleLabel, getDepartmentLabel

ApprovalsPage
    ├──→ Card, CardContent
    ├──→ Button, Input, Select
    ├──→ DataTable
    ├──→ Badge
    ├──→ getApprovalStatusLabel
    └──→ formatDate

AuditLogsPage
    ├──→ Card, CardContent
    ├──→ Button, Input, Select
    ├──→ DataTable
    └──→ formatDateTime

AdminPage
    ├──→ Card, CardHeader, CardTitle, CardContent
    ├──→ Button, Badge, Select, Input
    ├──→ Tabs, TabsList, TabsTrigger, TabsContent
    └──→ Link
```

---

## External Dependencies

### Runtime
- `next` — Framework (14.2.0 pinned; note security advisory — see discrepancy report)
- `react`, `react-dom` — UI
- `@prisma/client` — Database client
- `bcryptjs` — Password hashing (Node-only, not Edge)
- `jsonwebtoken` — JWT tokens (Node-only, API routes; not Edge)
- `jose` — JWT verification in Edge middleware (5.6.3, added 2026-09-16)
- `zod` — Validation schemas
- `date-fns` — Date formatting
- `clsx`, `tailwind-merge` — Class composition
- `lucide-react` — Icons
- `react-hook-form`, `@hookform/resolvers/zod` — Forms

### Build
- `prisma generate` now part of `build` and `postinstall` (Vercel cache fix 2026-09-16; pre-fails with `PrismaClientInitializationError` during `Collecting page data` otherwise)
- `next build` — Compiled successfully with Edge warnings removed post-jose migration (remaining lint warnings suppressed/flagged)

### Development
- `typescript` — Type checking
- `tailwindcss`, `postcss`, `autoprefixer` — Styling
- `eslint`, `eslint-config-next` — Linting
- `prisma` — ORM CLI
- `tsx` — TypeScript execution for scripts