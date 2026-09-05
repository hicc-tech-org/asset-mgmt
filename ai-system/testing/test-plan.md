# Test Plan

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-29
> - staleness-policy: re-verify when test coverage changes

> **Overview:** Test strategy covering unit, integration, and E2E tests per engineering principles §19.

---

## Test Pyramid

| Tier | Target Coverage | Tools | Location |
|------|----------------|-------|----------|
| Unit | 80%+ for lib/utils | Vitest | `src/**/*.test.ts` |
| Integration | Critical paths | Vitest + Test DB | `src/**/*.integration.test.ts` |
| E2E | Main user flows | Playwright | `e2e/**/*.spec.ts` |

---

## Unit Tests (Priority: High)

### src/lib/auth.ts
- [ ] hashPassword / verifyPassword roundtrip
- [ ] generateToken / verifyToken valid token
- [ ] verifyToken expired token returns null
- [ ] verifyToken tampered token returns null
- [ ] setAuthCookie / clearAuthCookie (mock cookies)

### src/lib/audit.ts
- [ ] createAuditLog creates record (mock Prisma)
- [ ] getAuditLogs filters by entityType/entityId
- [ ] getUserAuditLogs filters by actorId

### src/lib/utils.ts
- [ ] cn merges classes correctly
- [ ] formatDate formats correctly (en-GB)
- [ ] formatDateTime formats correctly
- [ ] generateAssetId returns unique IDs
- [ ] generateAccessoryId includes code prefix
- [ ] getInitials handles edge cases
- [ ] getRoleLabel maps all roles
- [ ] getDepartmentLabel maps all departments
- [ ] getAssetStatusLabel maps all statuses
- [ ] getApprovalStatusLabel maps all statuses

---

## Integration Tests (Priority: High)

### Authentication Flow
- [ ] POST /api/auth/login valid credentials → token cookie
- [ ] POST /api/auth/login invalid credentials → 401
- [ ] POST /api/auth/logout → clears cookie
- [ ] GET /api/auth/me with token → user data
- [ ] GET /api/auth/me without token → 401

### Asset Management
- [ ] POST /api/assets create asset (SuperAdmin)
- [ ] GET /api/assets list with filters
- [ ] GET /api/assets/[id] detail with relations
- [ ] PATCH /api/assets/[id] update asset
- [ ] DELETE /api/assets/[id] (SuperAdmin)
- [ ] POST /api/assets/assign assign to user
- [ ] POST /api/assets/assign already assigned → error
- [ ] POST /api/assets/return return asset
- [ ] POST /api/assets/return not assignee → error (unless IT)

### User Management
- [ ] POST /api/users create user (SuperAdmin)
- [ ] GET /api/users list with filters
- [ ] GET /api/users/[id] own profile
- [ ] PATCH /api/users/[id] update own profile
- [ ] PATCH /api/users/[id] admin updates role
- [ ] DELETE /api/users/[id] deactivate (SuperAdmin)

### Approval Workflow
- [ ] POST /api/approvals create request
- [ ] GET /api/approvals list with filters
- [ ] PATCH /api/approvals/[id] approve (current approver)
- [ ] PATCH /api/approvals/[id] reject (current approver)
- [ ] PATCH /api/approvals/[id] not current approver → 403
- [ ] Chain progression: HR → IT → Compliance
- [ ] High-value asset triggers Compliance approval

### Audit Logs
- [ ] GET /api/audit-logs with filters
- [ ] AuditLog created on asset assignment
- [ ] AuditLog created on approval action

---

## E2E Tests (Priority: Medium)

### User Flows
- [ ] Login → Dashboard → Assets list → Asset detail
- [ ] Login → Assets → Create new asset
- [ ] Login → Assets → Assign asset to user
- [ ] Login as employee → View assigned assets
- [ ] Login → Approvals → Approve pending request
- [ ] Login → Audit Logs → Filter and view
- [ ] Login → Admin → View system settings

### Role-Based Access
- [ ] SuperAdmin can access all pages
- [ ] IT Officer can assign assets
- [ ] HR Officer can approve requests
- [ ] Employee cannot access admin/users/approvals
- [ ] Employee can only see own assets

---

## Test Data Management

- Use separate test database (asset_mgmt_test)
- Seed with known data before each test suite
- Clean up after each test (transactions + rollback)
- Factory functions for creating test entities

---

## CI Integration

```yaml
# .github/workflows/test.yml
- Unit tests: npm run test:unit
- Integration tests: npm run test:integration  
- E2E tests: npm run test:e2e
- Type check: npm run typecheck
- Lint: npm run lint
```

---

## Current Status

| Tier | Status | Notes |
|------|--------|-------|
| Unit | ⏳ Not Started | Need to set up Vitest |
| Integration | ⏳ Not Started | Need test DB setup |
| E2E | ⏳ Not Started | Need Playwright setup |