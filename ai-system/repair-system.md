# Repair System

> **Metadata**
> - last-updated-by: bootstrap-project
> - last-verified-against-code: 2026-08-29
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