# Lessons Learned

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-23
> - staleness-policy: append-only, never remove entries

> **Overview:** Captured insights from development to avoid repeating mistakes and reinforce good practices.

---

## 2026-08-29 — Project Bootstrap

**Lesson**: Invest time in proper project structure and AI system documentation from day one

**Context**: Starting a fresh project with the opencode AI system

**What Worked**:
- Creating comprehensive Prisma schema upfront prevented later migrations
- Setting up base UI components before building pages ensured consistency
- Audit logging utility created early and used consistently
- AI system documentation (context, architecture, design system) provides excellent reference

**What Could Improve**:
- Should have set up testing infrastructure (Jest/Vitest + Playwright) earlier
- Docker configuration for consistent environments
- GitHub Actions CI pipeline from start

**Action Items**:
- [ ] Add test setup in next sprint
- [ ] Create Dockerfile and docker-compose
- [ ] Set up GitHub Actions workflow

---

## 2026-08-29 — Prisma Schema Design

**Lesson**: Model complex relationships carefully — self-referential for accessories, polymorphic for audit logs

**Context**: Designing Asset model to handle both main assets and accessories

**What Worked**:
- Self-referential Asset with parentAssetId cleanly models accessory relationships
- Unique accessoryId field enables tracking across reassignments
- JSON approvalChain flexible for varying chain lengths
- Enum types prevent invalid data at database level

**What Could Improve**:
- Consider adding AssetCategory enum value for "ACCESSORY" vs separate categories
- Add indexes for common query patterns (already done for assetId, status, assignedToId)

**Action Items**:
- Monitor query performance, add indexes as needed
- Consider materialized views for complex reports

---

## 2026-08-29 — API Route Organization

**Decision**: Group by resource, use standard REST patterns with custom actions as sub-routes

**What Worked**:
- `/api/assets` for list/create, `/api/assets/[id]` for item operations
- `/api/assets/assign` and `/api/assets/return` for custom actions
- Consistent error handling and response format
- Middleware handles auth, API routes check authorization

**Action Items**:
- Consider extracting business logic to service layer for testability
- Add request validation with Zod schemas

---

## 2026-08-29 — Component Architecture

**Lesson**: Build universal components first, compose pages from them

**Context**: Creating UI component library with Tailwind CSS

**What Worked**:
- Button, Input, Card, Badge, Table, Select, Textarea, Tabs cover 90% of needs
- cn() utility with clsx + tailwind-merge handles conditional classes
- Components follow Radix UI patterns for accessibility
- Design tokens in tailwind.config.ts, consumed via Tailwind classes

**What Could Improve**:
- Add more form components (Checkbox, Radio, DatePicker)
- Create form field wrapper with label/error handling
- Add toast/notification system
- Add modal/dialog component

**Action Items**:
- Build form field wrapper component
- Add toast system (sonner or custom)
- Add modal component

---

## 2026-09-16 — Vercel Build & Edge Runtime

**Lesson**: Vercel's dependency cache skips Prisma generation; Edge Runtime cannot import Node APIs.

**Context**: Vercel build `iad1` 2026-09-16 09:42: `Collecting page data for /api/approvals/[id]` failed with `PrismaClientInitializationError: Prisma has detected that this project was built on Vercel...` plus Edge warnings (`process.nextTick`, `setImmediate`, `process.version`) from `bcryptjs`/`jsonwebtoken` via `src/lib/auth.ts` imported into `src/middleware.ts`.

**What Worked**:
- Adding `prisma generate` to both `build` (`prisma generate && next build`) and `postinstall` (`prisma generate`) satisfies Vercel's troubleshooting guidance (https://pris.ly/d/vercel-build) and local installs
- Migrating middleware to `jose:jwtVerify` (async, Edge-compatible) cleanly separates Edge from Node auth. Shared `JWT_SECRET` via `TextEncoder` avoids config divergence. Middleware becoming `async` matches Next.js Edge expectation.
- Build warnings disappeared post-migration; `✓ Compiled successfully` confirms fix

**What Could Improve**:
- Should have enforced Edge/Node boundary from day one (lint rule or code-review checklist: "middleware may not import src/lib/auth")
- Should have followed Prisma + Vercel integration guide during bootstrap, not after first deploy failure
- Pinned `next@14.2.0` without checking security advisories; should run `npm audit` / check Next.js security blog pre-deploy

**Action Items**:
- [x] Document Edge/Node split in `index/dependency-graph.md` and `system-architecture.md`
- [x] Upgrade Next.js 14.2.0 to patched version (CVE https://nextjs.org/blog/security-update-2025-12-11) — done 2026-09-16 follow-up: `next` 15.5.25 + `eslint-config-next` 15.5.25
- [x] Upgrade `eslint@8.56.0` and `glob` to remove deprecation/vuln warns — done 2026-09-16 follow-up: `eslint` 9.31.0 flat config (`eslint.config.mjs` via FlatCompat)
- [x] Fix `react-hooks/exhaustive-deps` warnings (wrap fetchers in useCallback) — done 2026-09-16 follow-up: `React.useCallback` in 4 pages, lint `✔ No warnings`
- [ ] Add CI step: `npm run build` must pass before merge (catches Prisma/Edge/issues early — now also guards Next 15 async `cookies()` breaking change)
- [ ] Add `npm audit` to quality gate

---

## 2026-09-16 — Next 15 / ESLint 9 Migration & Exhaustive-Deps (follow-up)

**Lesson**: Major framework bumps (14→15) fix CVEs and deprecations but introduce breaking APIs (`cookies()` async) that must be codemodded together.

**Context**: Follow-up to 2026-09-16 deep sync. Remaining issues: `next@14.2.0` CVE, `eslint@8.56.0` deprecated + `glob@7`/`glob@10` vulns (`@humanwhocodes/*` deprecated), and 4× `react-hooks/exhaustive-deps` warnings. Upgrading `next` to `15.5.25` to allow `eslint@9` (config-next 14 only peers `^8`) exposed Next 15 `cookies()` Promise breaking change.

**What Worked**:
- Choosing `next@15.5.25` over `14.2.35` patch: CVE fixed and unlocks `eslint@9` flat config without override hacks, while keeping React `18.2.0` (Next 15 supports `^18 || ^19`). Build `prisma generate && next build` passes (`✓ Compiled successfully`, 21 routes, middleware 39 kB).
- `eslint 9.31.0` + `eslint-config-next 15.5.25` + `eslint.config.mjs` (FlatCompat `next/core-web-vitals`) removes all glob deprecation warnings; `next lint` now `✔ No ESLint warnings or errors` (previously 4 exhaustive-deps warnings). `FlatCompat` avoids full manual flat-config rewrite.
- `react-hooks/exhaustive-deps`: wrapping `fetch*` in `React.useCallback` with explicit deps and making `useEffect` depend on the callback is the minimal non-looping fix (tested across `approvals/assets/audit-logs/users` pages: `src/app/approvals/page.tsx:43-65`, etc.).
- `src/lib/auth.ts`: making `setAuthCookie`/`clearAuthCookie` `async` + `await cookies()` and updating `src/app/api/auth/{login,register,logout}/route.ts` to `await` fixes the `Promise<ReadonlyRequestCookies>` type error cleanly without touching `verifyToken`/`hashPassword` (still sync/Node-only).

**What Could Improve**:
- Should have anticipated Next 15 `cookies()` async codemod when bumping `next` major; `npm run typecheck` caught it (`Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'`), but CI would have caught earlier.
- `next lint` is deprecated in Next 15 — should migrate lint script to `eslint .` via `npx @next/codemod@canary next-lint-to-eslint-cli` in next sprint to future-proof.
- `prisma@5.10.0`→`8.0.0-rc` major available but not upgraded — evaluate separately (migration + Accelerate considerations).

**Action Items**:
- [x] Document async `cookies()` pattern in `system-architecture.md` (Auth Node) and `index/repo-map.md`
- [ ] Migrate `package.json:scripts.lint` from `next lint` to `eslint .` (requires flat config finalize + CI update)
- [ ] Evaluate Prisma 5→8 major upgrade
- [ ] Add `npm audit` pre-merge check

---

## 2026-09-16 — Config Fallback Discipline

**Lesson**: JWT secrets must have a single source of truth across runtimes.

**Context**: `src/lib/auth.ts` and `src/middleware.ts` both read `JWT_SECRET` with fallback `'your-super-secret-key-change-in-production'`. Edge uses `TextEncoder.encode()` while Node uses raw string for `jsonwebtoken`.

**What Worked**:
- Env-based config with fallback keeps dev workable; production enforces real secret via `.env`

**What Could Improve**:
- Fallback string value identical in both runtimes ensures tokens verify cross-runtime but is insecure if production forgets to set env

**Action Items**:
- [ ] Fail fast in production if `JWT_SECRET` is default/fallback (throw or warn prominently)
- [ ] Document required env vars in README and `.env.example` with `min 32 chars` note already present

---

## 2026-09-23 — Missing Routes & Layout Redundancy

**Lesson**: Scaffold every linked page before shipping nav; gate empty states behind loading skeletons; keep nav in one place.

**Context**: User reported 11+ `404 (_rsc)` for every `Link href` (`assets/new`, `assets/[id]/edit|assign|return`, `users/new|/[id]`, `admin/*`, `auth/logout`, `api/assets/new`) plus `Failed to fetch assets: TypeError`, redundant Header navbar alongside Sidebar, hamburger button no-op, dashboard mock numbers, and admin tabs read-only. Root cause: pages linked in UI but files not created; Header duplicated Sidebar nav; mobile state never wired; DataTable rendered empty immediately without `loading` gate.

**What Worked**:
- Creating all missing pages + APIs in one additive pass (no breaking changes) closed all 404s and grew `next build` 21→32 routes with `✓ Compiled successfully`. Client-side CSV/JSON import parse avoids extra deps; `skeleton.tsx` (`Skeleton`, `TableSkeleton`, `StatsSkeleton`) is reusable across 6 pages; Sidebar `localStorage` persistence for `collapsed` is zero-backend.
- Lifting `collapsed`/`mobileOpen` into `DashboardLayout` and passing as props keeps `Sidebar`/`Header` stateless and testable. Real dashboard `GET /api/dashboard/stats` (`count` + `groupBy`) replaces mocks with formatted `formatNumber` and `byCategory` chip row.

**What Could Improve**:
- Should have run `npm run build` + manual click-through of every Sidebar link before first deploy — would have caught 404s immediately. `knip` or `eslint` rule for dead `href`s would help.
- Should have enforced “nav belongs to Sidebar only” from day one; Header duplicated nav introduced redundancy that confused mobile IA.

**Action Items**:
- [ ] Add CI `npm run build` gate + smoke test that visits every `navigation` href (200 check)
- [ ] Add lint rule: `Header` must not contain `href` list duplicated from `Sidebar`
- [ ] Evaluate `prisma.$transaction` for bulk import atomicity (currently per-row best-effort with `results` array)

---

## 2026-09-23 — Query Params, Reassignment, Non-Breaking Extensibility, Preview

**Lesson**: Filters must be URL-synced from day one; extensibility should reuse existing tables (SystemConfig) to stay non-breaking; preview needs both Edge and Client coordination.

**Context**: Directive required `?department=...` in location/navbar to filter, admin to edit assignment via Selects (audit), departments/roles/permissions CRUD without breaking enums, and SUPERADMIN preview-as-role without sign-out. Previous pages used isolated React state, assignment endpoint blocked transfer, admin tabs were static.

**What Worked**:
- Wrapping list pages in `Suspense` + `useSearchParams` + `router.replace` with debounced search is minimal, additive, and makes every shared link (e.g., `/users?department=HR` from admin cards) work without breaking existing pagination/search.
- Reusing `SystemConfig` (`category=department|role`) for Departments/Roles CRUD merges enum fallback + config override — no Prisma migration, audit-logged, enum delete blocked, enum edit creates override. Non-breaking guarantee preserved.
- Extending `POST /api/assets/assign` to allow `isReassignment` (create `AssetTransfer`, audit TRANSFER) and `PATCH /api/assets/[id]` to detect assignment delta avoids a new endpoint; `assets/[id]/edit` Selects drive the same audit path.
- Preview as: `preview-role` cookie (SUPERADMIN-only API) + Edge `middleware` role override (`x-user-role`) + `Sidebar` nav filter (`baseNavigation` roles array) + purple banner + `admin` Preview tab gives full “see as other role” without auth bypass. Both server (data filtering) and client (nav visibility) respect preview.

**What Could Improve**:
- Should have URL-synced filters in initial implementation — would have avoided later retrofit and Suspense wrapping for all 4 pages.
- Departments/Roles via SystemConfig requires JSON parsing; future typed `Department`/`Role` Prisma models would give stronger validation — evaluate migration when extensibility stabilizes.
- Preview cookie is client-readable (`httpOnly:false`) for banner; consider `httpOnly:true` + server-rendered banner via middleware header if stronger isolation needed.

**Action Items**:
- [ ] Add CI smoke test: fetch `/users?department=HR` etc. returns filtered data (200)
- [ ] Add lint rule: new roles must be added to both `ENUM_ROLES` + `SystemConfig` seed if enum changes
- [ ] Document `SystemConfig` categories (`department`, `role`, `approval`, `notification`) in `system-architecture.md` Configuration Points

---

## Future Lessons

*Add new lessons here as they are learned*