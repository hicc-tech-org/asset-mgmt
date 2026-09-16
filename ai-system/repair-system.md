# Repair System

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
> - staleness-policy: re-verify when error patterns change

> **Overview:** Known error patterns and their fixes for this codebase. Used by `commands/fix-build.md`.

---

## Common Issues & Fixes

### Prisma Client Not Generated

**Error**: `PrismaClient is not defined` or `Cannot find module '@prisma/client'`

**Fix**:
```bash
npm run db:generate
```

**Prevention**: Run after any schema.prisma changes

---

### Vercel: PrismaClientInitializationError — Vercel Build Cache

**Error**:
```
Prisma has detected that this project was built on Vercel, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered.
PrismaClientInitializationError ... at .../node_modules/@prisma/client/runtime/library.js:34:69
Build error occurred — Error: Failed to collect page data for /api/approvals/[id]
```

**Cause**: Vercel caches `node_modules`; `prisma generate` not run on cached build.

**Fix** (applied 2026-09-16, PR #5):
```json
// package.json
"scripts": {
  "build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```
Reference: https://pris.ly/d/vercel-build

**Prevention**: Keep `build` and `postinstall` as above; CI must run `npm run build` locally before merge.

---

### Edge Runtime — Node APIs Not Supported

**Error** (build warnings, then runtime risk):
```
A Node.js API is used (process.nextTick / setImmediate / process.version) which is not supported in the Edge Runtime.
Import trace: ./node_modules/bcryptjs/dist/bcrypt.js -> ./src/lib/auth.ts
Import trace: ./node_modules/jsonwebtoken/... -> ./src/lib/auth.ts
```

**Cause**: `src/middleware.ts` imported `src/lib/auth.ts` which transitively pulls `bcryptjs`/`jsonwebtoken` (Node-only).

**Fix** (applied 2026-09-16):
- `src/middleware.ts` now imports `jose:jwtVerify` (Edge-compatible), `async` middleware, `TextEncoder.encode(JWT_SECRET)` shared key.
- `src/lib/auth.ts` remains Node-only (API routes only).

**Prevention**: Middleware must not import `src/lib/auth.ts`; lint/review rule: "Edge must use `jose`, Node must use `jsonwebtoken`/`bcryptjs`".

---

### Next.js 15 — `cookies()` Async Breaking Change

**Error** (typecheck/build):
```
Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'.
  export function setAuthCookie(token: string) {
    cookies().set('auth-token', token, {...})
               ^^^
Property 'delete' does not exist on type 'Promise<ReadonlyRequestCookies>'.
```

**Cause**: Next.js 15 makes `next/headers:cookies()` async (returns `Promise`). Previous `src/lib/auth.ts` called `cookies().set/delete` sync.

**Fix** (applied 2026-09-16 follow-up, Next 15.5.25 migration):
```ts
// src/lib/auth.ts
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, { httpOnly: true, ... })
}
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}
// call sites
await setAuthCookie(token) // src/app/api/auth/login & register
await clearAuthCookie()    // src/app/api/auth/logout
// getSession already await cookies()
```

**Prevention**: After any `next` major bump, run `npm run typecheck` + `npm run build`; grep `cookies()` and ensure `await`.

---

### ESLint 9 / Glob Deprecations & Flat Config Migration

**Error** (install warnings + `next lint` deprecated):
```
npm warn deprecated glob@7.2.3 / glob@10.3.10 — Old versions contain vuln
npm warn deprecated @humanwhocodes/config-array@0.11.14 / object-schema@2.0.3
npm warn deprecated eslint@8.56.0 — no longer supported
`next lint` is deprecated and will be removed in Next.js 16.
```

**Cause**: `eslint@8.56.0` + `eslint-config-next@14.2.0` tree depends on old `glob` and `@humanwhocodes/*`. Next 14 cannot peer `eslint@9`.

**Fix** (applied 2026-09-16 follow-up):
- `next` 14.2.0 → 15.5.25, `eslint-config-next` 14.2.0 → 15.5.25 (peers `eslint ^9`), `eslint` 8.56.0 → 9.31.0
- `.eslintrc.js` → `eslint.config.mjs` (flat config, `FlatCompat` `next/core-web-vitals`, ignores `.next/out/build/next-env.d.ts`)
- Glob vuln removed via `eslint@9` using `@eslint/config-array` / `@eslint/eslintrc` (no `glob` 7/10 in tree). Verify: `npm install` shows no glob warnings.

**Prevention**: Pin `eslint` major to `next` peer range; migrate to flat config via `npx @next/codemod@canary next-lint-to-eslint-cli` when upgrading Next.

---

### React Hooks — `exhaustive-deps` Missing Dependency

**Error** (lint):
```
65:6  Warning: React Hook React.useEffect has a missing dependency: 'fetchApprovals'. Either include it or remove the dependency array. react-hooks/exhaustive-deps
(src/app/{approvals,assets,audit-logs,users}/page.tsx)
```

**Cause**: `fetch*` defined inline captures `page`/`filters`/`pageSize` closure. `useEffect` depended on `[page, filters]` but not on the function itself, causing stale closure risk and lint warning.

**Fix** (applied 2026-09-16 follow-up):
```ts
const fetchApprovals = React.useCallback(async () => { ... }, [page, pageSize, filters.status, filters.type])
React.useEffect(() => { fetchApprovals() }, [fetchApprovals])
// Similarly: fetchAssets [page, pageSize, filters.status, filters.category, filters.search]
// fetchLogs [page, pageSize, filters.entityType, filters.action, filters.actorId]
// fetchUsers [page, pageSize, filters.department, filters.role, filters.search]
```

**Prevention**: All data-fetch callbacks used in `useEffect` must be `useCallback`-wrapped with explicit deps; future lint `✔ No warnings`.

---

### Next.js Security Vulnerability (CVE 2025-12-11)

**Error** (install warn):
```
npm warn deprecated next@14.2.0: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11
```

**Fix** (applied 2026-09-16 follow-up): `next` 14.2.0 → 15.5.25 (latest 15 stable, includes patch). Verified `jose` Edge compat, `next.config.js` serverActions, and `await params` remain compatible. Build/lint/typecheck pass.

**Prevention**: Run `npm audit` + check Next.js security blog pre-deploy; keep `next` pinned to latest stable minor within major.

---

### Database Connection Failed

**Error**: `P1001: Can't reach database server` or `ECONNREFUSED`

**Causes**:
- PostgreSQL not running
- Wrong DATABASE_URL in .env
- Database doesn't exist

**Fix**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Or start Docker container
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=asset_mgmt -p 5432:5432 -d postgres:14

# Verify .env has correct URL
cat .env | grep DATABASE_URL
```

---

### Migration Issues

**Error**: `P3000: Failed to apply migration` or schema drift

**Fix**:
```bash
# For development: push schema directly
npm run db:push

# For production: create migration
npm run db:migrate

# Reset database (dev only)
npx prisma migrate reset
```

---

### TypeScript Errors

**Error**: Type errors after schema changes

**Fix**:
```bash
npm run db:generate
npm run typecheck
```

**Common Causes**:
- Prisma client not regenerated after schema change
- Missing type imports
- Strict mode violations

---

### Next.js Build Errors

**Error**: `Module not found` or build failures

**Fix**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for circular imports
```

---

### Authentication Issues

**Error**: `401 Unauthorized` on protected routes

**Causes**:
- JWT_SECRET not set in .env
- Cookie not being set (check Secure flag in production)
- Token expired (7-day default)
- Middleware not matching route

**Fix**:
```bash
# Verify .env has JWT_SECRET (min 32 chars)
# Check cookie in browser dev tools
# Verify middleware matcher in src/middleware.ts
```

---

### Tailwind Styles Not Applied

**Error**: Components missing styles

**Causes**:
- Content paths in tailwind.config.ts don't match file locations
- PostCSS not processing
- JIT mode issues

**Fix**:
```bash
# Verify tailwind.config.ts content paths
# Restart dev server
npm run dev
```

---

### API Route Errors

**Error**: `500 Internal Server Error` on API routes

**Debugging**:
```bash
# Check server logs in terminal
# Add console.log in API route
# Verify Prisma queries in Prisma Studio
npm run db:studio
```

**Common Causes**:
- Missing await on Prisma calls
- Incorrect where clauses
- Authorization check failures
- Audit log creation errors (non-blocking)

---

### Seed Script Failures

**Error**: Seed script throws error

**Fix**:
```bash
# Run with verbose output
npx tsx prisma/seed.ts

# Common issues:
# - Unique constraint violations (run db:push first)
# - Foreign key references missing
# - Enum values don't match schema
```

---

## Debugging Commands

```bash
# View database
npm run db:studio

# Check Prisma schema validity
npx prisma validate

# View generated client types
cat node_modules/@prisma/client/index.d.ts | head -100

# Check environment variables
cat .env

# View Next.js build output
npm run build 2>&1 | head -50

# Run typecheck
npm run typecheck

# Run lint
npm run lint
```

---

## Emergency Procedures

### Database Corruption / Data Loss

1. Stop application
2. Restore from latest backup
3. Run `npm run db:push` to ensure schema matches
4. Restart application

### Security Incident (JWT Secret Compromised)

1. Generate new JWT_SECRET
2. Update .env and redeploy
3. All existing sessions invalidated (users re-login)
4. Audit recent audit logs for suspicious activity

### Performance Degradation

1. Check database query performance in Prisma Studio
2. Add missing indexes (see schema @@index)
3. Enable query logging in development
4. Consider pagination for large datasets