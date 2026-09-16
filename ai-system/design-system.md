# Design System

> **Metadata**
> - last-updated-by: update-ai-system
> - last-verified-against-code: 2026-09-16
> - staleness-policy: re-verify if UI components or styling dependencies change

> **Overview:** Visual language, component patterns, and UX principles. Agents building UI must read this before writing any frontend code. The colour, typography, and spacing tables below are the **single source of truth** for design tokens (per `standards/engineering-principles.md` §5) — components must consume these tokens rather than redeclaring values.

---

## Visual Language

### Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| primary-50 | #f0f9ff | Light backgrounds, hover states |
| primary-100 | #e0f2fe | Subtle backgrounds |
| primary-200 | #bae6fd | Borders, dividers |
| primary-300 | #7dd3fc | Disabled states |
| primary-400 | #38bdf8 | Secondary actions |
| primary-500 | #0ea5e9 | Primary brand color |
| primary-600 | #0284c7 | **Primary buttons, links, CTAs** |
| primary-700 | #0369a1 | Primary hover |
| primary-800 | #075985 | Primary active |
| primary-900 | #0c4a6e | Dark text on primary |
| secondary-500 | #64748b | Secondary actions |
| background | #ffffff | Page background (light) |
| background-dark | #0f172a | Page background (dark) |
| surface | #ffffff | Cards, modals (light) |
| surface-dark | #1e293b | Cards, modals (dark) |
| text-primary | #111827 | Main body text (light) |
| text-primary-dark | #f9fafb | Main body text (dark) |
| text-muted | #6b7280 | Labels, captions (light) |
| text-muted-dark | #9ca3af | Labels, captions (dark) |
| danger-500 | #ef4444 | Errors, destructive actions |
| danger-600 | #dc2626 | Destructive button hover |
| success-500 | #22c55e | Confirmations, success states |
| success-600 | #16a34a | Success button hover |
| warning-500 | #f59e0b | Warnings, pending states |
| warning-600 | #d97706 | Warning button hover |

### Typography

| Style | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| Heading 1 | Inter | 30px (1.875rem) | 700 (Bold) | 1.2 |
| Heading 2 | Inter | 24px (1.5rem) | 600 (Semi-bold) | 1.3 |
| Heading 3 | Inter | 20px (1.25rem) | 600 (Semi-bold) | 1.4 |
| Heading 4 | Inter | 18px (1.125rem) | 600 (Semi-bold) | 1.4 |
| Body Large | Inter | 16px (1rem) | 400 (Normal) | 1.5 |
| Body | Inter | 14px (0.875rem) | 400 (Normal) | 1.5 |
| Body Small | Inter | 13px (0.8125rem) | 400 (Normal) | 1.5 |
| Caption | Inter | 12px (0.75rem) | 400 (Normal) | 1.5 |
| Code | JetBrains Mono | 13px (0.8125rem) | 400 (Normal) | 1.6 |
| Button | Inter | 14px (0.875rem) | 500 (Medium) | 1.2 |

### Spacing Scale

Base unit: 4px (0.25rem)

| Step | Value | Rem | Usage |
|------|-------|-----|-------|
| 1 | 4px | 0.25rem | Micro spacing |
| 2 | 8px | 0.5rem | Tight spacing |
| 3 | 12px | 0.75rem | Compact spacing |
| 4 | 16px | 1rem | **Base spacing** |
| 5 | 20px | 1.25rem | Comfortable spacing |
| 6 | 24px | 1.5rem | Section spacing |
| 8 | 32px | 2rem | Large section spacing |
| 10 | 40px | 2.5rem | Page section spacing |
| 12 | 48px | 3rem | Major section spacing |
| 16 | 64px | 4rem | Page padding |

---

## Component Patterns

### Buttons

- **Primary**: `bg-primary-600 text-white hover:bg-primary-700` — Main CTAs, form submits
- **Secondary**: `bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700` — Secondary actions
- **Destructive**: `bg-red-600 text-white hover:bg-red-700` — Delete, remove, reject
- **Outline**: `border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800` — Alternative actions
- **Ghost**: `hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100` — Subtle actions, toolbar buttons
- **Sizes**: sm (h-9 px-3), md (h-10 px-4), lg (h-11 px-8)
- **Disabled**: `opacity-50 pointer-events-none`

### Forms

- **Input fields**: `h-10 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-900`
- **Labels**: `text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block`
- **Error messages**: `text-sm text-red-600 dark:text-red-400 mt-1` (below input)
- **Helper text**: `text-sm text-gray-500 dark:text-gray-400 mt-1`
- **Select**: Same as input with chevron icon
- **Textarea**: `min-h-[80px] resize-y`
- **Checkbox/Radio**: Custom styled with primary color

### Navigation

- **Sidebar**: Fixed left (lg+), collapsible on mobile, 256px (w-64)
- **Header**: Sticky top, 64px (h-16), breadcrumb + user menu
- **Tabs**: Horizontal, underline indicator, keyboard navigable
- **Breadcrumbs**: `text-sm text-gray-500` with `/` separators

### Cards / Containers

- **Default**: `rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900`
- **Padding**: p-6 for content, px-6 py-4 for headers
- **Hover**: `hover:shadow-md transition-shadow` for interactive cards

### Modals / Dialogs

- **Backdrop**: `fixed inset-0 bg-black/50`
- **Container**: `max-w-md w-full mx-4`, centered
- **Header**: Title + close button, border-b
- **Content**: Scrollable, max-h-[80vh]
- **Footer**: Right-aligned actions, border-t

### Tables

- **Header**: `h-12 px-4 text-left font-medium text-gray-500 border-b`
- **Row**: `border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50`
- **Cell**: `p-4 align-middle`
- **Pagination**: Bottom, page size from config (default 25)

---

## UX Principles

1. **Always show loading state for async actions** — Skeleton loaders for lists, spinner for buttons
2. **Destructive actions require confirmation** — Modal with action description, not toast
3. **Error messages must explain what the user can do** — Not just "Error occurred"
4. **Form validation inline** — Show errors on blur, clear on input
5. **Keyboard navigation for all interactive elements** — Focus visible, tab order logical
6. **Consistent empty states** — Icon, message, action button
7. **Optimistic UI where safe** — Immediate feedback, rollback on error
8. **Respect user preferences** — Dark mode, reduced motion

---

## Responsive Breakpoints

| Breakpoint | Value | Target |
|------------|-------|--------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Wide screens |
| 2xl | 1536px | Ultra-wide |

Sidebar collapses at < lg (1024px), becomes drawer on mobile.

---

## Accessibility Requirements

- All interactive elements must have keyboard focus states (`focus-visible:ring-2`)
- Colour contrast must meet WCAG AA (4.5:1 for text, 3:1 for UI elements)
- Images must have alt text
- Forms must have associated labels (`htmlFor` + `id`)
- ARIA labels for icon-only buttons
- Semantic HTML (nav, main, section, article, aside)
- Live regions for dynamic content (toasts, loading)
- Skip to main content link

---

## Reference Library

External design languages — competitor, inspiration, or reference sites — pulled into `design-references/<name>/DESIGN.md` (Tier 4, read when explicitly relevant). The `generate-design-md` command creates them.

These are **inputs to be reconciled**, never the project's source of truth. The token tables in this file remain the single source of truth per engineering principles §5. Promotion from a reference into the project's real tokens is a human decision, not an agent write.

See `design-references/README.md` for the folder contract.

---

## Design Asset Viewer (dev-only entry point)

A human-facing route to browse design assets — HTML mocks, images, PDFs — without those assets touching the app's real route table when deployed. This is a dev tool, not an agent workflow, and it is itself governed by the engineering principles like any other page.

**Hard rules (not conventions):**
- Mounted at a distinct, configurable base path (e.g. `/__design/*`) on its own router/middleware branch — never nested under app routes.
- **Gated:** only mountable when the env flag is set (e.g. `ENABLE_DESIGN_VIEWER=true`), defaulting off. **Never enabled in a production build regardless of the flag** — this is a hard rule, not a convention.
- Reads a config manifest (engineering principles §1) listing which local folders/paths it is allowed to serve — never an open filesystem browser.
- No hardcoded asset lists in code.

**Rendering by type:**
- HTML → sandboxed iframe
- Images → `<img>`
- PDF → render pages; where text/structure extraction is needed, use the classify-then-extract approach from the `pdf-html-asset-inspection` skill (detect text vs scanned, extract with position awareness, convert to Markdown) via a small internal utility or thin wrapper.

**Extraction backend decision:** chooses between the two registered extraction candidates (see `tools/registry.md` → PDF-extraction-tooling rows; approach documented in `tools/integrations/`) based on the project stack; the choice is documented in `memory/project-decisions.md`.

**Where it lives:** see also the `system-architecture.md` configuration points template (the `ENABLE_DESIGN_VIEWER` flag) and the viewer's security isolation note for the deployment platform.