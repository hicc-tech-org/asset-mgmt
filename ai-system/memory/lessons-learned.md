# Lessons Learned

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
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
- [ ] Add CI step: `npm run build` must pass before merge (catches Prisma/Edge issues early)
- [ ] Upgrade Next.js 14.2.0 to patched version (CVE https://nextjs.org/blog/security-update-2025-12-11)
- [ ] Upgrade `eslint@8.56.0` and `glob` to remove deprecation/vuln warns
- [ ] Fix `react-hooks/exhaustive-deps` warnings (wrap fetchers in useCallback)
- [ ] Add `npm audit` to quality gate

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

## Future Lessons

*Add new lessons here as they are learned*