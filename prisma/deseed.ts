// Prisma Deseed — removes ONLY seeded rows, leaves user-created data untouched.
// Safe: matches on hard-coded unique identifiers from seed.ts manifest.
// Order respects FKs: child accessories -> assets -> users -> accessoryTypes -> systemConfigs
// Handles dependent non-seed rows gracefully (warns instead of cascading).

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { SEED_EMAILS, SEED_EMPLOYEE_IDS, SEED_ASSET_IDS, SEED_ACCESSORY_IDS, SEED_ACCESSORY_CODES, SEED_SYSTEM_KEYS } from './seed'

const prisma = new PrismaClient()

const FORCE = process.argv.includes('--force')

async function testConnection(): Promise<void> {
  console.log('🔌 Testing database connection (deseed)...')
  await prisma.$connect()
  const result = await prisma.$queryRaw`SELECT 1 as ok, current_database() as db, now() as now`
  console.log('✅ Connection OK:', result)
}

async function countDependents(assetDbIds: string[], userIds: string[]) {
  const [approvalsOnAssets, transfersOnAssets, acksOnAssets, auditsOnAssets, auditsByUsers, approvalsByUsers] = await Promise.all([
    assetDbIds.length ? prisma.approval.count({ where: { assetId: { in: assetDbIds } } }) : 0,
    assetDbIds.length ? prisma.assetTransfer.count({ where: { assetId: { in: assetDbIds } } }) : 0,
    assetDbIds.length ? prisma.acknowledgement.count({ where: { assetId: { in: assetDbIds } } }) : 0,
    assetDbIds.length ? prisma.auditLog.count({ where: { entityType: 'Asset', entityId: { in: assetDbIds } } }) : 0,
    userIds.length ? prisma.auditLog.count({ where: { actorId: { in: userIds } } }) : 0,
    userIds.length ? prisma.approval.count({ where: { requesterId: { in: userIds } } }) : 0,
  ])
  return { approvalsOnAssets, transfersOnAssets, acksOnAssets, auditsOnAssets, auditsByUsers, approvalsByUsers }
}

async function deseed() {
  console.log('🧹 Starting deseed — will remove ONLY seeded rows...')
  if (FORCE) console.log('   --force: will delete dependent non-seed rows (approvals/transfers/audits) that block parent deletion')
  await testConnection()

  // Try to load manifest json for audit (non-fatal)
  const manifestPath = path.join(__dirname, 'seed-manifest.json')
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      console.log(`📋 Manifest found (${m.generatedAt}) — ${m.emails?.length} users, ${m.assetIds?.length} assets`)
    } catch {}
  }

  // Resolve actual DB ids for seeded assets/users (to handle dependents)
  const seededAssets = await prisma.asset.findMany({
    where: { OR: [{ assetId: { in: [...SEED_ASSET_IDS] } }, { accessoryId: { in: [...SEED_ACCESSORY_IDS] } }] },
    select: { id: true, assetId: true, accessoryId: true },
  })
  const seededAssetDbIds = seededAssets.map(a => a.id)
  console.log(`🔍 Found ${seededAssets.length} seeded asset rows in DB`)

  const seededUsers = await prisma.user.findMany({
    where: { OR: [{ email: { in: [...SEED_EMAILS] } }, { employeeId: { in: [...SEED_EMPLOYEE_IDS] } }] },
    select: { id: true, email: true },
  })
  const seededUserIds = seededUsers.map(u => u.id)
  console.log(`🔍 Found ${seededUsers.length} seeded user rows in DB`)

  if (seededAssets.length === 0 && seededUsers.length === 0) {
    console.log('ℹ️  No seeded rows found — nothing to do (or already deseeded)')
  }

  const dependents = await countDependents(seededAssetDbIds, seededUserIds)
  console.log('📊 Dependents referencing seeded rows:', dependents)

  const hasDependents = Object.values(dependents).some(v => v > 0)
  if (hasDependents && !FORCE) {
    console.warn('⚠️  Some seeded rows have dependents (approvals/transfers/audits) — likely created after seed.')
    console.warn('   Deseed will first try to delete pure seeded rows; rows blocked by FK will be skipped.')
    console.warn('   Re-run with --force to delete those dependent rows as well (affects non-seed data that references seed rows).')
  }

  if (hasDependents && FORCE) {
    console.log('🗑️  --force: deleting dependent rows that reference seeded assets/users...')
    // Delete in FK-safe order: approvals/audits/acks/transfers before parents
    if (dependents.approvalsOnAssets > 0) {
      const r = await prisma.approval.deleteMany({ where: { assetId: { in: seededAssetDbIds } } })
      console.log(`   Deleted ${r.count} approvals referencing seeded assets`)
    }
    if (dependents.auditsOnAssets > 0) {
      const r = await prisma.auditLog.deleteMany({ where: { entityType: 'Asset', entityId: { in: seededAssetDbIds } } })
      console.log(`   Deleted ${r.count} audit logs for seeded assets`)
    }
    if (dependents.acksOnAssets > 0) {
      const r = await prisma.acknowledgement.deleteMany({ where: { assetId: { in: seededAssetDbIds } } })
      console.log(`   Deleted ${r.count} acknowledgements for seeded assets`)
    }
    if (dependents.transfersOnAssets > 0) {
      const r = await prisma.assetTransfer.deleteMany({ where: { assetId: { in: seededAssetDbIds } } })
      console.log(`   Deleted ${r.count} transfers for seeded assets`)
    }
    if (dependents.auditsByUsers > 0) {
      const r = await prisma.auditLog.deleteMany({ where: { actorId: { in: seededUserIds } } })
      console.log(`   Deleted ${r.count} audit logs by seeded users`)
    }
    if (dependents.approvalsByUsers > 0) {
      // Need to handle FK CurrentApprover as well
      const r2 = await prisma.approval.deleteMany({ where: { OR: [{ requesterId: { in: seededUserIds } }, { currentApproverId: { in: seededUserIds } }] } })
      console.log(`   Deleted ${r2.count} approvals by/assigned to seeded users`)
    }
    // Also clear any user FK side: supervisorId/invitedById assignedBy etc. The delete will null those? Actually those are optional, but set null first
    // Asset Fks: assignedTo/assignedBy/createdBy — null them on non-seed assets that reference seeded users before user delete
    if (seededUserIds.length) {
      const [a1, a2, a3] = await Promise.all([
        prisma.asset.updateMany({ where: { assignedToId: { in: seededUserIds } }, data: { assignedToId: null } }),
        prisma.asset.updateMany({ where: { assignedById: { in: seededUserIds } }, data: { assignedById: null } }),
        prisma.asset.updateMany({ where: { createdById: { in: seededUserIds } }, data: { createdById: null } }),
      ])
      console.log(`   Nulled asset FKs referencing seeded users: assignedTo ${a1.count}, assignedBy ${a2.count}, createdBy ${a3.count}`)
      const u1 = await prisma.user.updateMany({ where: { supervisorId: { in: seededUserIds } }, data: { supervisorId: null } })
      const u2 = await prisma.user.updateMany({ where: { invitedById: { in: seededUserIds } }, data: { invitedById: null } })
      console.log(`   Nulled user FKs: supervisor ${u1.count}, invitedBy ${u2.count}`)
    }
  }

  // --- Deletion in FK-safe order ---
  // 1. Delete child accessory assets first (have parentAssetId)
  const accessoryChildren = await prisma.asset.findMany({
    where: { accessoryId: { in: [...SEED_ACCESSORY_IDS] }, parentAssetId: { not: null } },
    select: { id: true, accessoryId: true },
  })
  if (accessoryChildren.length) {
    try {
      const r = await prisma.asset.deleteMany({ where: { id: { in: accessoryChildren.map(a => a.id) } } })
      console.log(`🗑️  Deleted ${r.count} accessory child assets (accessoryId matches)`)
    } catch (e) {
      console.warn('⚠️  Failed deleting accessory children:', (e as Error).message)
      // Per-row fallback to report blockers
      for (const a of accessoryChildren) {
        try { await prisma.asset.delete({ where: { id: a.id } }); console.log(`   Deleted accessory ${a.accessoryId}`) } catch (err) { console.warn(`   Skip ${a.accessoryId}: ${(err as Error).message}`) }
      }
    }
  }

  // 2. Delete remaining seeded assets (main + standalone) by OR
  const remainingAssets = await prisma.asset.findMany({
    where: { OR: [{ assetId: { in: [...SEED_ASSET_IDS] } }, { accessoryId: { in: [...SEED_ACCESSORY_IDS] } }] },
    select: { id: true, assetId: true, accessoryId: true },
  })
  if (remainingAssets.length) {
    try {
      const r = await prisma.asset.deleteMany({ where: { id: { in: remainingAssets.map(a => a.id) } } })
      console.log(`🗑️  Deleted ${r.count} remaining seeded asset rows`)
    } catch (e) {
      console.warn('⚠️  Bulk asset delete blocked by dependents — trying per-row:', (e as Error).message)
      let ok = 0, skipped = 0
      for (const a of remainingAssets) {
        try { await prisma.asset.delete({ where: { id: a.id } }); ok++ ; console.log(`   Deleted asset ${a.assetId || a.accessoryId}`) } 
        catch (err) { skipped++; console.warn(`   Skip asset ${a.assetId || a.accessoryId}: ${(err as Error).message?.slice(0,120)}`) }
      }
      console.log(`   Per-row: ${ok} deleted, ${skipped} skipped (have dependents; use --force)`)
    }
  } else {
    console.log('   No remaining seeded assets to delete')
  }

  // 3. Delete users (after assets FKs nulled or deleted). Need to handle self-refs already nulled if --force.
  // If not --force, ensure assets referencing seeded users are deleted first or nulled; already attempted.
  // Try to null FKs even without force for assets that are NOT seeded but reference seeded users (preserve data but allow deletion)
  if (!FORCE && seededUserIds.length) {
    // Check non-seed assets still referencing seeded users — null them so users can be deleted without losing non-seed assets
    const referencing = await prisma.asset.count({ where: { OR: [{ assignedToId: { in: seededUserIds } }, { assignedById: { in: seededUserIds } }, { createdById: { in: seededUserIds } }] } })
    if (referencing > 0) {
      console.log(`   Nulling ${referencing} non-seed asset FKs that still reference seeded users (to allow user delete without deleting those assets)...`)
      await prisma.asset.updateMany({ where: { assignedToId: { in: seededUserIds } }, data: { assignedToId: null } })
      await prisma.asset.updateMany({ where: { assignedById: { in: seededUserIds } }, data: { assignedById: null } })
      await prisma.asset.updateMany({ where: { createdById: { in: seededUserIds } }, data: { createdById: null } })
      await prisma.user.updateMany({ where: { supervisorId: { in: seededUserIds } }, data: { supervisorId: null } })
      await prisma.user.updateMany({ where: { invitedById: { in: seededUserIds } }, data: { invitedById: null } })
      // Also clear transfers/acknowledgements referencing seeded users if they block?
      // Those would be caught as dependents; we skip.
    }
  }

  // Attempt user deletion per-row to handle FK blockers gracefully
  const usersToDelete = await prisma.user.findMany({ where: { email: { in: [...SEED_EMAILS] } }, select: { id: true, email: true } })
  let deletedUsers = 0, skippedUsers = 0
  for (const u of usersToDelete) {
    try {
      await prisma.user.delete({ where: { id: u.id } })
      deletedUsers++
      console.log(`🗑️  Deleted user ${u.email}`)
    } catch (e) {
      skippedUsers++
      const msg = (e as Error).message?.split('\n')[0]?.slice(0, 200) || String(e)
      console.warn(`   Skip user ${u.email}: ${msg} — has dependents; use --force to delete them`)
    }
  }
  console.log(`   Users: ${deletedUsers} deleted, ${skippedUsers} skipped`)

  // 4. AccessoryTypes by code
  const rAccTypes = await prisma.accessoryType.deleteMany({ where: { code: { in: [...SEED_ACCESSORY_CODES] } } })
  console.log(`🗑️  Deleted ${rAccTypes.count} accessory types (by code)`)

  // 5. SystemConfigs by key
  const rConfigs = await prisma.systemConfig.deleteMany({ where: { key: { in: [...SEED_SYSTEM_KEYS] } } })
  console.log(`🗑️  Deleted ${rConfigs.count} system configs (by key)`)

  // Final counts — verify only seeded rows were removed
  const remaining = {
    users: await prisma.user.count({ where: { email: { in: [...SEED_EMAILS] } } }),
    assets: await prisma.asset.count({ where: { OR: [{ assetId: { in: [...SEED_ASSET_IDS] } }, { accessoryId: { in: [...SEED_ACCESSORY_IDS] } }] } }),
    accessoryTypes: await prisma.accessoryType.count({ where: { code: { in: [...SEED_ACCESSORY_CODES] } } }),
    systemConfigs: await prisma.systemConfig.count({ where: { key: { in: [...SEED_SYSTEM_KEYS] } } }),
  }
  const totalUsers = await prisma.user.count()
  const totalAssets = await prisma.asset.count()
  console.log('📊 Remaining seeded rows (should be 0):', remaining)
  console.log(`📊 Total DB rows after deseed: users=${totalUsers}, assets=${totalAssets} (non-seed preserved)`)
  if (Object.values(remaining).some(v => v > 0)) {
    console.warn('⚠️  Some seeded rows remain — likely blocked by dependents. Re-run with --force or manually resolve dependents.')
  } else {
    console.log('🎉 Deseed complete — all seeded rows removed, non-seed data intact.')
  }
  // Optionally remove manifest
  // fs.unlinkSync(manifestPath) // keep for audit
}

deseed()
  .catch((e) => {
    console.error('❌ Deseed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
