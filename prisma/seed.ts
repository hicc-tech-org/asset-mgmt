// Prisma Seed Script — deseedable, idempotent, connection-testing
// Runtime: uses DATABASE_URL (pooled). Migrations use DIRECT_URL (schema.prisma directUrl).
import { PrismaClient, UserRole, Department, AssetCategory, AssetStatus } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Seed manifest — single source of truth for deseed.
// Every created row's unique identifier is listed here, hard-coded, so
// deseed can delete exactly this set without touching user-created data.
// ---------------------------------------------------------------------------

export const SEED_USERS = [
  { email: 'admin@company.com', firstName: 'Super', lastName: 'Admin', employeeId: 'EMP-001', role: UserRole.SUPERADMIN, department: Department.IT },
  { email: 'hr.head@company.com', firstName: 'Grace', lastName: 'Adebayo', employeeId: 'EMP-002', role: UserRole.HR_HEAD, department: Department.HR },
  { email: 'it.head@company.com', firstName: 'David', lastName: 'Okonkwo', employeeId: 'EMP-003', role: UserRole.IT_HEAD, department: Department.IT },
  { email: 'compliance.head@company.com', firstName: 'Fatima', lastName: 'Mohammed', employeeId: 'EMP-004', role: UserRole.COMPLIANCE_HEAD, department: Department.COMPLIANCE },
  { email: 'it.officer@company.com', firstName: 'Hamed', lastName: 'Musa', employeeId: 'EMP-005', role: UserRole.IT_OFFICER, department: Department.IT },
  { email: 'hr.officer@company.com', firstName: 'Kayode', lastName: 'Lawal', employeeId: 'EMP-006', role: UserRole.HR_OFFICER, department: Department.HR },
  { email: 'compliance.officer@company.com', firstName: 'Olubukola', lastName: 'Koyenikan', employeeId: 'EMP-007', role: UserRole.COMPLIANCE_OFFICER, department: Department.COMPLIANCE },
  { email: 'timileyin.olaore@company.com', firstName: 'Timileyin', lastName: 'Olaore', employeeId: 'EMP-008', role: UserRole.EMPLOYEE, department: Department.IT },
  { email: 'obinna.uzorka@company.com', firstName: 'Obinna', lastName: 'Uzorka', employeeId: 'EMP-009', role: UserRole.EMPLOYEE, department: Department.IT },
  { email: 'thomas.micheal@company.com', firstName: 'Thomas', lastName: 'Micheal', employeeId: 'EMP-010', role: UserRole.EMPLOYEE, department: Department.IT },
  { email: 'ogechuku.okunna@company.com', firstName: 'Ogechuku', lastName: 'Okunna', employeeId: 'EMP-011', role: UserRole.EMPLOYEE, department: Department.HR },
  { email: 'abiodun@company.com', firstName: 'Abiodun', lastName: 'Adeyemi', employeeId: 'EMP-012', role: UserRole.EMPLOYEE, department: Department.MARKETING },
] as const

export const SEED_EMAILS = SEED_USERS.map(u => u.email)
export const SEED_EMPLOYEE_IDS = SEED_USERS.map(u => u.employeeId)

export const SEED_ACCESSORY_TYPES = [
  { name: 'Charger', code: 'CHR', description: 'Power adapter for laptops and devices' },
  { name: 'Keyboard', code: 'KEY', description: 'External keyboard' },
  { name: 'Mouse', code: 'MOU', description: 'External mouse' },
  { name: 'Headset', code: 'HED', description: 'Audio headset with microphone' },
  { name: 'Carrying Case', code: 'CAS', description: 'Protective carrying case or bag' },
  { name: 'Docking Station', code: 'DOC', description: 'Docking station for laptops' },
] as const

export const SEED_ACCESSORY_CODES = SEED_ACCESSORY_TYPES.map(a => a.code)
export const SEED_ACCESSORY_NAMES = SEED_ACCESSORY_TYPES.map(a => a.name)

export const SEED_SYSTEM_CONFIGS = [
  { key: 'high_value_threshold', value: 100000 },
  { key: 'approval_reminder_days', value: 3 },
  { key: 'email_notifications_enabled', value: true },
] as const

export const SEED_SYSTEM_KEYS = SEED_SYSTEM_CONFIGS.map(s => s.key)

// Deterministic asset + accessory identifiers — never use Date.now()
export const SEED_ASSET_IDS = [
  '7D9D0A1CDA2F',
  'FF4716A917DE',
  'ED43A12200E7',
  'A108FF8A3EC5',
  'CT-WDFZV0AGM61540', // standalone CHARGER asset (assetId == serial)
  'C94GRAT#BH5',
  '8D603EA#BH5',
] as const

export const SEED_ACCESSORY_IDS = [
  'ACC-CHR-001',
  'CHARGER-CT:WFZJR0F1RCETNV',
  'CHARGER-CT:WEQJA0B1R9O5EI',
  'CHARGER-CT:557C60BM5PF3CL',
  'ACC-CHR-CT-WDFZV0AGM61540', // standalone accessoryId for CT-WDFZV asset
  'CT:WTYYV 2cored',
  'CT:WMVXQ',
] as const

// Mapping: which parent assetId owns which accessoryId (deterministic accessory assetId)
const ACCESSORY_PARENT_MAP: Record<string, string> = {
  'ACC-CHR-001': '7D9D0A1CDA2F',
  'CHARGER-CT:WFZJR0F1RCETNV': 'FF4716A917DE',
  'CHARGER-CT:WEQJA0B1R9O5EI': 'ED43A12200E7',
  'CHARGER-CT:557C60BM5PF3CL': 'A108FF8A3EC5',
  'CT:WTYYV 2cored': 'C94GRAT#BH5',
  'CT:WMVXQ': '8D603EA#BH5',
  // ACC-CHR-CT-WDFZV0AGM61540 is itself the standalone asset, not an accessory child
}

// For accessory child assets, deterministic assetId
function accessoryAssetId(parentAssetId: string, accessoryId: string): string {
  return `AST-ACC-${parentAssetId}-${accessoryId.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase()}`
}

async function testConnection(): Promise<void> {
  console.log('🔌 Testing database connection...')
  const dbUrl = process.env.DATABASE_URL || ''
  const directUrl = process.env.DIRECT_URL || ''
  console.log(`   DATABASE_URL: ${dbUrl ? dbUrl.replace(/:[^:@]*@/, ':****@').slice(0, 80) + '...' : 'NOT SET'}`)
  console.log(`   DIRECT_URL:   ${directUrl ? directUrl.replace(/:[^:@]*@/, ':****@').slice(0, 80) + '...' : 'NOT SET (migrations will fail without it)'}`)
  if (!dbUrl) throw new Error('DATABASE_URL is not set')
  if (!directUrl) console.warn('⚠️  DIRECT_URL not set — migrations/introspection will use DATABASE_URL fallback; set DIRECT_URL for pooled environments (Supabase etc.)')

  await prisma.$connect()
  const result = await prisma.$queryRaw`SELECT 1 as ok, version() as version, current_database() as db, now() as now`
  console.log('✅ Connection OK:', result)
  // Verify Prisma models are queryable
  const userCount = await prisma.user.count()
  console.log(`   Prisma ORM OK — User table reachable (count=${userCount})`)
}

async function main() {
  console.log('🌱 Starting database seed (deseedable, idempotent)...')
  await testConnection()

  // Create Users
  const passwordMap: Record<string, string> = {
    'admin@company.com': 'admin123',
    'hr.head@company.com': 'hrhead123',
    'it.head@company.com': 'ithead123',
    'compliance.head@company.com': 'comphead123',
    'it.officer@company.com': 'itofficer123',
    'hr.officer@company.com': 'hroffice123',
    'compliance.officer@company.com': 'compofficer123',
  }
  const defaultEmpPassword = await hashPassword('employee123')

  const userByEmail: Record<string, { id: string }> = {}

  for (const u of SEED_USERS) {
    const plain = passwordMap[u.email] || 'employee123'
    const hash = passwordMap[u.email] ? await hashPassword(plain) : defaultEmpPassword
    // Provide full create payload per user to satisfy required fields
    const jobTitleMap: Record<string, string> = {
      'admin@company.com': 'System Administrator',
      'hr.head@company.com': 'Head of Human Resources',
      'it.head@company.com': 'Head of Information Technology',
      'compliance.head@company.com': 'Head of Compliance',
      'it.officer@company.com': 'IT Officer',
      'hr.officer@company.com': 'HR Officer',
      'compliance.officer@company.com': 'Compliance Officer',
      'timileyin.olaore@company.com': 'Software Engineer',
      'obinna.uzorka@company.com': 'Data Analyst',
      'thomas.micheal@company.com': 'DevOps Engineer',
      'ogechuku.okunna@company.com': 'HR Specialist',
      'abiodun@company.com': 'Communications Officer',
    }
    const campusMap: Record<string, string> = {
      'ogechuku.okunna@company.com': 'Lekki',
    }
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {}, // idempotent — do not overwrite manual changes
      create: {
        email: u.email,
        passwordHash: hash,
        firstName: u.firstName,
        lastName: u.lastName,
        employeeId: u.employeeId,
        jobTitle: jobTitleMap[u.email] || 'Employee',
        department: u.department,
        role: u.role,
        campus: campusMap[u.email] || 'Central',
        isActive: true,
      },
    })
    userByEmail[u.email] = { id: created.id }
    console.log(`✅ User upserted: ${u.email} (${u.role})`)
  }

  // Convenience lookups for assignment
  const itOfficer = userByEmail['it.officer@company.com']
  const hrOfficer = userByEmail['hr.officer@company.com']
  const superAdmin = userByEmail['admin@company.com']
  const complianceOfficer = userByEmail['compliance.officer@company.com']
  const abiodun = userByEmail['abiodun@company.com']
  const obinna = userByEmail['obinna.uzorka@company.com']
  const timileyin = userByEmail['timileyin.olaore@company.com']

  // Accessory Types
  for (const acc of SEED_ACCESSORY_TYPES) {
    await prisma.accessoryType.upsert({
      where: { code: acc.code },
      update: {},
      create: acc,
    })
  }
  console.log('✅ Accessory types upserted')

  // Assets — deterministic, idempotent
  type AssetSeed = {
    assetId: string
    category: AssetCategory
    name: string
    brand: string
    model: string
    serialNumber: string
    condition: string
    status: AssetStatus
    purchaseDate: Date
    assignedToId?: string
    assignedById?: string
    assignedAt?: Date
    createdById: string
    accessoryId?: string
  }

  const assets: AssetSeed[] = [
    {
      assetId: '7D9D0A1CDA2F',
      category: AssetCategory.LAPTOP,
      name: 'EliteBook 840 G8 Notebook PC',
      brand: 'HP',
      model: 'EliteBook 840 G8 11th Gen /16GB RAM/CORE i7',
      serialNumber: '5CG2139556',
      condition: 'Good',
      status: AssetStatus.AVAILABLE,
      purchaseDate: new Date('2026-07-29'),
      assignedById: itOfficer.id,
      createdById: superAdmin.id,
    },
    {
      assetId: 'FF4716A917DE',
      category: AssetCategory.LAPTOP,
      name: 'EliteBook 840 G8 Notebook PC',
      brand: 'HP',
      model: 'EliteBook 840 G8 11th Gen /16GB RAM/CORE i7',
      serialNumber: '5CG208B0JG',
      condition: 'Good',
      status: AssetStatus.ASSIGNED,
      purchaseDate: new Date('2026-07-29'),
      assignedToId: complianceOfficer.id,
      assignedById: itOfficer.id,
      assignedAt: new Date('2026-07-29'),
      createdById: superAdmin.id,
    },
    {
      assetId: 'ED43A12200E7',
      category: AssetCategory.LAPTOP,
      name: 'EliteBook 840 G8 Notebook PC',
      brand: 'HP',
      model: 'EliteBook 840 G8 11th Gen /16GB RAM/CORE i7',
      serialNumber: '5CG20845XR',
      condition: 'Good',
      status: AssetStatus.ASSIGNED,
      purchaseDate: new Date('2026-07-29'),
      assignedToId: complianceOfficer.id, // fallback if Debora not present
      assignedById: itOfficer.id,
      assignedAt: new Date('2026-07-29'),
      createdById: superAdmin.id,
    },
    {
      assetId: 'A108FF8A3EC5',
      category: AssetCategory.LAPTOP,
      name: '240R 14 Inch G10 Notebook PC',
      brand: 'HP',
      model: '240R 14 Inch G10 Notebook 10th Gen/8GB RAM/CORE 3',
      serialNumber: '5CG53458B6',
      condition: 'New',
      status: AssetStatus.ASSIGNED,
      purchaseDate: new Date('2026-07-29'),
      assignedById: itOfficer.id,
      createdById: superAdmin.id,
    },
    {
      assetId: 'CT-WDFZV0AGM61540',
      category: AssetCategory.CHARGER,
      name: 'HP CHARGER',
      brand: 'HP',
      model: 'HP Charger',
      serialNumber: 'CT-WDFZV0AGM61540',
      condition: 'New',
      status: AssetStatus.ASSIGNED,
      purchaseDate: new Date('2026-07-05'),
      assignedToId: abiodun.id,
      assignedById: hrOfficer.id,
      assignedAt: new Date('2026-07-05'),
      createdById: superAdmin.id,
      accessoryId: 'ACC-CHR-CT-WDFZV0AGM61540',
    },
    {
      assetId: 'C94GRAT#BH5',
      category: AssetCategory.LAPTOP,
      name: '240R 14 Inch G10 Notebook PC',
      brand: 'HP',
      model: '240R 14 Inch G10 Notebook 10th Gen/8GB RAM/CORE 3',
      serialNumber: '5CG5472NJG',
      condition: 'New',
      status: AssetStatus.ASSIGNED,
      purchaseDate: new Date('2026-07-11'),
      assignedToId: obinna.id,
      assignedById: itOfficer.id,
      assignedAt: new Date('2026-07-11'),
      createdById: superAdmin.id,
    },
    {
      assetId: '8D603EA#BH5',
      category: AssetCategory.LAPTOP,
      name: 'Victus by HP GAMING LAPTOP 15-FA1XXX',
      brand: 'HP',
      model: '13th Gen/16GB RAM/CORE I5',
      serialNumber: '5CD439GT2N',
      condition: 'New',
      status: AssetStatus.ASSIGNED,
      purchaseDate: new Date('2026-07-11'),
      assignedToId: timileyin.id,
      assignedById: itOfficer.id,
      assignedAt: new Date('2026-07-11'),
      createdById: superAdmin.id,
    },
  ]

  // Upsert each main asset
  const assetByAssetId: Record<string, { id: string; assignedToId: string | null; assignedById: string | null; assignedAt: Date | null }> = {}
  for (const a of assets) {
    const created = await prisma.asset.upsert({
      where: { assetId: a.assetId },
      update: {},
      create: a,
    })
    assetByAssetId[a.assetId] = { id: created.id, assignedToId: created.assignedToId, assignedById: created.assignedById, assignedAt: created.assignedAt }
    console.log(`✅ Asset upserted: ${a.assetId} (${a.name})`)
  }

  // Accessories as child Assets
  const accessoryDefs: Array<{ accessoryId: string; parentAssetId: string; name: string; category: AssetCategory; brand: string; model: string }> = [
    { accessoryId: 'ACC-CHR-001', parentAssetId: '7D9D0A1CDA2F', name: 'HP Charger', category: AssetCategory.CHARGER, brand: 'HP', model: 'HP Charger' },
    { accessoryId: 'CHARGER-CT:WFZJR0F1RCETNV', parentAssetId: 'FF4716A917DE', name: 'HP Charger', category: AssetCategory.CHARGER, brand: 'HP', model: 'HP Charger' },
    { accessoryId: 'CHARGER-CT:WEQJA0B1R9O5EI', parentAssetId: 'ED43A12200E7', name: 'HP Charger', category: AssetCategory.CHARGER, brand: 'HP', model: 'HP Charger' },
    { accessoryId: 'CHARGER-CT:557C60BM5PF3CL', parentAssetId: 'A108FF8A3EC5', name: 'HP Charger', category: AssetCategory.CHARGER, brand: 'HP', model: 'HP Charger' },
    { accessoryId: 'CT:WTYYV 2cored', parentAssetId: 'C94GRAT#BH5', name: 'HP Charger', category: AssetCategory.CHARGER, brand: 'HP', model: 'HP Charger' },
    { accessoryId: 'CT:WMVXQ', parentAssetId: '8D603EA#BH5', name: 'HP Charger', category: AssetCategory.CHARGER, brand: 'HP', model: 'HP Charger' },
  ]

  for (const acc of accessoryDefs) {
    const parent = assetByAssetId[acc.parentAssetId]
    if (!parent) {
      console.warn(`⚠️  Parent asset not found for accessory ${acc.accessoryId} — skipping`)
      continue
    }
    const detAssetId = accessoryAssetId(acc.parentAssetId, acc.accessoryId)
    await prisma.asset.upsert({
      where: { accessoryId: acc.accessoryId },
      update: {},
      create: {
        assetId: detAssetId,
        accessoryId: acc.accessoryId,
        name: acc.name,
        category: acc.category,
        brand: acc.brand,
        model: acc.model,
        status: AssetStatus.ASSIGNED,
        assignedToId: parent.assignedToId,
        assignedById: parent.assignedById,
        assignedAt: parent.assignedAt,
        parentAssetId: parent.id,
        createdById: superAdmin.id,
      },
    })
    console.log(`✅ Accessory upserted: ${acc.accessoryId} -> ${detAssetId}`)
  }

  // System Configs
  const configs = [
    { key: 'high_value_threshold', value: 100000, category: 'approval', description: 'Threshold for high-value asset approval requiring Compliance Head' },
    { key: 'approval_reminder_days', value: 3, category: 'approval', description: 'Days before sending approval reminder' },
    { key: 'email_notifications_enabled', value: true, category: 'notification', description: 'Enable email notifications for approvals and assignments' },
  ]
  for (const c of configs) {
    await prisma.systemConfig.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    })
  }
  console.log('✅ System configs upserted')

  // Write seed manifest JSON for audit / deseed verification
  try {
    const manifestPath = path.join(__dirname, 'seed-manifest.json')
    const manifest = {
      generatedAt: new Date().toISOString(),
      emails: [...SEED_EMAILS],
      employeeIds: [...SEED_EMPLOYEE_IDS],
      assetIds: [...SEED_ASSET_IDS],
      accessoryIds: [...SEED_ACCESSORY_IDS],
      accessoryCodes: [...SEED_ACCESSORY_CODES],
      systemKeys: [...SEED_SYSTEM_KEYS],
      note: 'Deseed deletes only rows matching these identifiers. Safe to commit; deseed reads this or the static lists above.',
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`📝 Manifest written: ${manifestPath}`)
  } catch (e) {
    console.warn('⚠️  Could not write seed-manifest.json:', e)
  }

  const counts = {
    users: await prisma.user.count({ where: { email: { in: [...SEED_EMAILS] } } }),
    assets: await prisma.asset.count({ where: { OR: [{ assetId: { in: [...SEED_ASSET_IDS] } }, { accessoryId: { in: [...SEED_ACCESSORY_IDS] } }] } }),
    accessoryTypes: await prisma.accessoryType.count({ where: { code: { in: [...SEED_ACCESSORY_CODES] } } }),
    systemConfigs: await prisma.systemConfig.count({ where: { key: { in: [...SEED_SYSTEM_KEYS] } } }),
  }
  console.log('🎉 Seed completed successfully!', counts)
  console.log('   Run `npm run db:deseed` to remove only this seeded data.')
}

// Only run when executed directly, not when imported by deseed
const _seedArg = process.argv[1]?.replace(/\\/g, '/') || ''
const isDirectRun = (_seedArg.endsWith('/prisma/seed.ts') || _seedArg.endsWith('/seed.ts')) && !_seedArg.endsWith('/deseed.ts')
if (isDirectRun) {
  main()
    .catch((e) => {
      console.error('❌ Seed failed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
export { main as seedMain, testConnection, accessoryAssetId }
