# Repo Map

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-29
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
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
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
│   │   │   └── [id]/route.ts         # PATCH approve/reject
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
│   ├── prisma.ts                     # Prisma client
│   ├── auth.ts                       # Auth utilities
│   ├── audit.ts                      # Audit logging
│   └── utils.ts                      # Common utilities
├── types/                            # TypeScript types (future)
└── hooks/                            # React hooks (future)
```

---

## Key Entry Points

| Purpose | File |
|---------|------|
| App entry | `src/app/layout.tsx` |
| Home page | `src/app/page.tsx` (redirects to /dashboard) |
| Dashboard | `src/app/dashboard/page.tsx` |
| API routes | `src/app/api/*/route.ts` |
| Database | `prisma/schema.prisma` |
| Auth | `src/lib/auth.ts` |
| UI components | `src/components/ui/*` |
| Layout | `src/components/layout/dashboard-layout.tsx` |