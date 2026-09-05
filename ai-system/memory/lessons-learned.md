# Lessons Learned

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-29
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

## Future Lessons

*Add new lessons here as they are learned*