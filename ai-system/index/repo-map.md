# Repo Map

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
> - staleness-policy: re-verify if folder structure changes

> **Overview:** Folder structure with purpose of each directory.

---

## Root

```
asset-mgmt/
├── .github/workflows/        # CI/CD pipelines
├── ai-system/                # AI agent documentation & protocols
├── prisma/                   # Database schema & migrations
├── src/                      # Application source code
├── .env.example              # Environment template
├── .gitignore
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs         # ESLint flat config (v9, replaces .eslintrc.js)
├── README.md
├── VERSION                   # Installed AI system version marker
├── MIGRATION.md / V2_TO_V3_MIGRATION.md / CHANGELOG.md
└── cookies.txt               # Dev-only auth cookie dump (ignored in prod)
```

---

## ai-system/

```
ai-system/
├── agents/                   # Agent role definitions
│   ├── architect.md
│   ├── implementer.md
│   ├── reviewer.md
│   ├── tester-qa.md
│   ├── planner.md
│   └── historian.md
├── checkpoints/              # Session state
│   ├── in-progress.md
│   └── session-log.md
├── commands/                 # Agent command definitions
│   ├── audit-drift.md
│   ├── audit-sources.md
│   ├── bootstrap-project.md
│   ├── cloud-session.md
│   ├── dev-cycle.md
│   ├── execute-feature.md
│   ├── fix-build.md
│   ├── generate-design-md.md
│   ├── plan-feature.md
│   ├── pull-template-update.md
│   ├── refactor-codebase.md
│   ├── resume-session.md
│   ├── sync-context.md
│   ├── update-ai-system.md
│   ├── verify-work.md
│   └── visual-review.md
├── design-references/        # External design references
│   ├── README.md
│   └── TEMPLATE/DESIGN.md
├── index/                    # Codebase indexes
│   ├── dependency-graph.md
│   └── repo-map.md
├── memory/                   # Long-term memory
│   ├── architecture-history.md
│   ├── lessons-learned.md
│   └── project-decisions.md
├── planning/                 # Project planning
│   ├── project-plan.md
│   └── task-queue.md
├── protocols/                # Operational protocols
│   ├── context-tiering.md
│   ├── entry-protocol.md
│   ├── escalation-rules.md
│   ├── quality-gate.md
│   └── verification-rules.md
├── skills/                   # Specialized skills
│   ├── acid-transaction-review/
│   ├── design-token-extraction/
│   ├── gh-stack/
│   ├── integration-wrapper-scaffold/
│   ├── lean-debt-audit/
│   ├── pdf-html-asset-inspection/
│   ├── rbac-page-scaffold/
│   ├── research/
│   └── universal-component-check/
├── standards/                # Engineering standards
│   └── engineering-principles.md
├── summaries/                # Development summaries
│   └── dev-history.md
├── testing/                  # Test artifacts
│   ├── test-plan.md
│   └── test-results.md
├── tools/                    # Tool registry
│   ├── integrations/
│   └── registry.md
├── ai-context.md
├── design-system.md
├── project-context.md
├── repair-system.md
└── system-architecture.md
```

---

## prisma/

```
prisma/
├── schema.prisma             # Database schema
├── seed.ts                   # Seed script
└── migrations/               # Migration history (generated)
```

---

## src/

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── assets/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   ├── [id]/route.ts         # GET, PATCH, DELETE
│   │   │   ├── assign/route.ts       # POST assign asset
│   │   │   └── return/route.ts       # POST return asset
│   │   ├── users/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   └── [id]/route.ts         # GET, PATCH, DELETE
│   │   ├── approvals/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   └── [id]/route.ts         # PATCH approve/reject (async params)
│   │   └── audit-logs/
│   │       └── route.ts              # GET with filters
│   ├── auth/
│   │   └── login/page.tsx            # Login page
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard
│   ├── assets/
│   │   ├── page.tsx                  # Asset list
│   │   ├── new/page.tsx              # Create asset (TODO)
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Asset detail
│   │   │   ├── edit/page.tsx         # Edit asset (TODO)
│   │   │   ├── assign/page.tsx       # Assign asset (TODO)
│   │   │   └── return/page.tsx       # Return asset (TODO)
│   ├── users/
│   │   ├── page.tsx                  # User list
│   │   ├── new/page.tsx              # Invite user (TODO)
│   │   └── [id]/page.tsx             # User detail (TODO)
│   ├── approvals/
│   │   └── page.tsx                  # Approvals list
│   ├── audit-logs/
│   │   └── page.tsx                  # Audit logs list
│   ├── admin/
│   │   └── page.tsx                  # Admin panel
│   ├── globals.css                   # Global styles + Tailwind
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home redirect
├── components/
│   ├── ui/                           # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   └── tabs.tsx
│   ├── forms/                        # Form components (future)
│   ├── tables/                       # Table components (future)
│   └── layout/                       # Layout components
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── dashboard-layout.tsx
├── lib/                              # Core utilities
│   ├── prisma.ts                     # Prisma client singleton (globalThis guard)
│   ├── auth.ts                       # Auth utilities (bcryptjs + jsonwebtoken, Node runtime; Next 15: async cookies() — setAuthCookie/clearAuthCookie are async)
│   ├── audit.ts                      # Audit logging
│   └── utils.ts                      # Common utilities
├── middleware.ts                     # Edge middleware — MUST use jose (Edge-compatible), not jsonwebtoken/bcryptjs
├── types/                            # TypeScript types (future)
└── hooks/                            # React hooks (future)
```

> **Note:** `src/middleware.ts` is Edge Runtime. It was migrated from `src/lib/auth.ts:verifyToken` (jsonwebtoken) to `jose:jwtVerify` on 2026-09-16 to fix Vercel build warnings (`bcryptjs`/`jsonwebtoken` Node APIs not supported in Edge). `src/lib/auth.ts` remains Node-only for API routes; middleware must stay Edge-compatible.

---

## Key Entry Points

| Purpose | File |
|---------|------|
| App entry | `src/app/layout.tsx` |
| Home page | `src/app/page.tsx` (redirects to /dashboard) |
| Dashboard | `src/app/dashboard/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| Database | `prisma/schema.prisma` |
| Auth (Node) | `src/lib/auth.ts` |
| Auth (Edge) | `src/middleware.ts` (jose) |
| UI components | `src/components/ui/*` |
| Layout | `src/components/layout/dashboard-layout.tsx` |
| Build | `package.json:scripts.build` = `prisma generate && next build`; `postinstall` = `prisma generate` (Vercel cache fix) |
| Lint | `eslint.config.mjs` (flat config, ESLint 9.31, `next/core-web-vitals` via FlatCompat) — replaces `.eslintrc.js` |

## Drift Fixed 2026-09-16

- Build: Added `prisma generate` to `build` and `postinstall` to fix `PrismaClientInitializationError: Prisma has detected that this project was built on Vercel...` observed in Vercel build `iad1` on 2026-09-16 (phase: Collecting page data for /api/approvals/[id]).
- Edge: Middleware migrated to `jose:jwtVerify` (async) — decouples Edge from Node-only `jsonwebtoken`/`bcryptjs`. Previous build emitted warnings for `process.nextTick`, `setImmediate`, `process.version` in Edge Runtime.
- Middleware is async and reads `auth-token` cookie + sets `x-user-*` headers for server components; `await params` pattern used in `src/app/api/approvals/[id]/route.ts` matches Next.js 14/15 async params.

## Drift Fixed 2026-09-16 (follow-up)

- Next.js CVE: Upgraded `next` + `eslint-config-next` from `14.2.0` to `15.5.25` (security update https://nextjs.org/blog/security-update-2025-12-11). Verified Edge `jose` compatibility and `next.config.js` serverActions.
- ESLint/Glob: Upgraded `eslint` `8.56.0` → `9.31.0`, migrated `.eslintrc.js` → `eslint.config.mjs` (flat config, FlatCompat). Glob vuln (`glob@7`/`glob@10` deprecated) removed via eslint 9 tree (`@eslint/config-array`). `next lint` is deprecated in Next 15 — future migration is `eslint .` via `npx @next/codemod next-lint-to-eslint-cli`.
- Exhaustive-deps: Wrapped `fetchApprovals`/`fetchAssets`/`fetchLogs`/`fetchUsers` in `React.useCallback` with explicit deps; `useEffect` now depends on callback — `✔ No ESLint warnings or errors`.
- Next 15 async cookies: `src/lib/auth.ts:setAuthCookie`/`clearAuthCookie` made `async` + `await cookies()`; call sites (`/api/auth/login`, `/register`, `/logout`) now `await` — fixes `Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'` type error introduced by Next 15.