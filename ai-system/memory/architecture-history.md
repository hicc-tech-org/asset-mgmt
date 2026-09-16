# Architecture History

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
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

## 2026-09-16 — Edge/Build Hardening (Sprint 2.1)

**Decision**: Split auth verification by runtime + make build Vercel-aware

**Context**: Vercel build failure on `Collecting page data for /api/approvals/[id]` (`PrismaClientInitializationError` — cached deps without `prisma generate`) and Edge Runtime warnings from importing Node-only `bcryptjs`/`jsonwebtoken` into middleware.

**Alternatives Considered**:
- Keep `jsonwebtoken` in middleware with polyfills — Rejected: Edge Runtime explicitly bans `process.nextTick`/`setImmediate`/`process.version`; polyfilling is brittle.
- `next-auth` — Rejected: Custom JWT + HttpOnly cookies already ship; migration cost outweighs benefit for MVP.
- Move middleware to Node runtime — Rejected: Middleware must run on Edge per Next.js; Node runtime defeats intended latency/protection.

**Outcome**: 
- `package.json:scripts.build = "prisma generate && next build"` + `postinstall = "prisma generate"` (fixes Vercel cache per https://pris.ly/d/vercel-build)
- `src/middleware.ts` now `async` + `jose:jwtVerify` (Edge-compatible), isolated from `src/lib/auth.ts` (Node-only: bcryptjs + jsonwebtoken)
- `jose@5.6.3` added; both runtimes share `JWT_SECRET` (TextEncoder-encoded in Edge)
- `src/app/api/approvals/[id]/route.ts` uses `await params` (Next.js 14 async params) — verified compatible

**Patterns Established**:
- Edge/Node boundary documented in `index/dependency-graph.md` and `system-architecture.md`
- Build must include `prisma generate` (verification CLI updated)
- Drift: Next.js 14.2.0 CVE remains open; ESLint exhaustive-deps warnings remain open

---

## 2026-09-16 — Next.js 15 / ESLint 9 Upgrade & Exhaustive-Deps Fix (follow-up)

**Decision**: Close remaining 2026-09-16 deep-sync discrepancies: Next.js CVE + eslint/glob + exhaustive-deps + Next 15 async cookies.

**Context**: Deep sync flagged high-severity Next.js 14.2.0 CVE (https://nextjs.org/blog/security-update-2025-12-11), medium eslint 8.56 deprecation + `glob@7`/`glob@10` vuln (`@humanwhocodes/*` deprecated), and low exhaustive-deps warnings in 4 list pages. Next 15 introduces breaking `cookies()` async API.

**Alternatives Considered**:
- Patch to Next 14.2.35 only (stay on 14) — Rejected: fixes CVE but retains eslint 8 incompatibility (eslint-config-next 14 only peers `^7 || ^8`, cannot adopt eslint 9 flat config to fix glob vuln without override hacks).
- Next 15 + eslint 9 flat config — Chosen: 15.5.25 is latest 15 stable (`next-15-3` dist-tag successor, `backport` 15.5.25), peers `eslint ^9`, allows `eslint.config.mjs` migration, keeps React 18.2.0 compatibility (`^18 || ^19`), verified build/lint/typecheck pass.
- Keep `.eslintrc.js` legacy config — Rejected: eslint 9 deprecates legacy config; flat config via `FlatCompat` is the supported migration path (Next docs: `npx @next/codemod next-lint-to-eslint-cli`).

**Outcome**:
- `next` 14.2.0 → 15.5.25, `eslint-config-next` 14.2.0 → 15.5.25, `eslint` 8.56.0 → 9.31.0; `.eslintrc.js` → `eslint.config.mjs` (FlatCompat `next/core-web-vitals`, ignores `.next/out/build/next-env.d.ts`); glob vuln removed (eslint 9 uses `@eslint/config-array`).
- `src/app/{approvals,assets,audit-logs,users}/page.tsx` — `fetch*` wrapped in `React.useCallback` with explicit deps, `useEffect` depends on callback; `npm run lint` now `✔ No ESLint warnings or errors`.
- `src/lib/auth.ts` — `setAuthCookie`/`clearAuthCookie` changed to `async` + `await cookies()`; `src/app/api/auth/{login,register,logout}/route.ts` now `await` them — fixes Next 15 type error `Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'`.
- Build verified: `prisma generate && next build` → `✓ Compiled successfully`, 21 routes, middleware 39 kB, no Edge warnings, `Collecting page data` no longer `PrismaClientInitializationError`.

**Patterns Established**:
- Next 15 async cookies: all `next/headers:cookies()` call sites must `await` (Node runtime). Lint rule: no sync `cookies().set/delete/get` in route handlers.
- ESLint flat config: `eslint.config.mjs` is source of truth via `FlatCompat`; `next lint` is deprecated (Next 15) — future `eslint .` migration via codemod.
- `react-hooks/exhaustive-deps`: fetchers that depend on `page/filters` must be `useCallback` to satisfy deps without infinite loops.

---

## Future Entries

*Add new entries here as architecture evolves*