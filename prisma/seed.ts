// Prisma Seed Script
import { PrismaClient, UserRole, Department, AssetCategory, AssetStatus } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  
  // Create Super Admin
  const superAdminPassword = await hashPassword('admin123')
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      employeeId: 'EMP-001',
      jobTitle: 'System Administrator',
      department: Department.IT,
      role: UserRole.SUPERADMIN,
      campus: 'Central',
      isActive: true,
    },
  })
  console.log('✅ Created super admin:', superAdmin.email)
  
  // Create Department Heads
  const hrHeadPassword = await hashPassword('hrhead123')
  const hrHead = await prisma.user.upsert({
    where: { email: 'hr.head@company.com' },
    update: {},
    create: {
      email: 'hr.head@company.com',
      passwordHash: hrHeadPassword,
      firstName: 'Grace',
      lastName: 'Adebayo',
      employeeId: 'EMP-002',
      jobTitle: 'Head of Human Resources',
      department: Department.HR,
      role: UserRole.HR_HEAD,
      campus: 'Central',
      isActive: true,
    },
  })
  console.log('✅ Created HR Head:', hrHead.email)
  
  const itHeadPassword = await hashPassword('ithead123')
  const itHead = await prisma.user.upsert({
    where: { email: 'it.head@company.com' },
    update: {},
    create: {
      email: 'it.head@company.com',
      passwordHash: itHeadPassword,
      firstName: 'David',
      lastName: 'Okonkwo',
      employeeId: 'EMP-003',
      jobTitle: 'Head of Information Technology',
      department: Department.IT,
      role: UserRole.IT_HEAD,
      campus: 'Central',
      isActive: true,
    },
  })
  console.log('✅ Created IT Head:', itHead.email)
  
  const complianceHeadPassword = await hashPassword('comphead123')
  const complianceHead = await prisma.user.upsert({
    where: { email: 'compliance.head@company.com' },
    update: {},
    create: {
      email: 'compliance.head@company.com',
      passwordHash: complianceHeadPassword,
      firstName: 'Fatima',
      lastName: 'Mohammed',
      employeeId: 'EMP-004',
      jobTitle: 'Head of Compliance',
      department: Department.COMPLIANCE,
      role: UserRole.COMPLIANCE_HEAD,
      campus: 'Central',
      isActive: true,
    },
  })
  console.log('✅ Created Compliance Head:', complianceHead.email)
  
  // Create IT Officers
  const itOfficerPassword = await hashPassword('itofficer123')
  const itOfficer = await prisma.user.upsert({
    where: { email: 'it.officer@company.com' },
    update: {},
    create: {
      email: 'it.officer@company.com',
      passwordHash: itOfficerPassword,
      firstName: 'Hamed',
      lastName: 'Musa',
      employeeId: 'EMP-005',
      jobTitle: 'IT Officer',
      department: Department.IT,
      role: UserRole.IT_OFFICER,
      campus: 'Central',
      isActive: true,
    },
  })
  console.log('✅ Created IT Officer:', itOfficer.email)
  
  // Create HR Officers
  const hrOfficerPassword = await hashPassword('hroffice123')
  const hrOfficer = await prisma.user.upsert({
    where: { email: 'hr.officer@company.com' },
    update: {},
    create: {
      email: 'hr.officer@company.com',
      passwordHash: hrOfficerPassword,
      firstName: 'Kayode',
      lastName: 'Lawal',
      employeeId: 'EMP-006',
      jobTitle: 'HR Officer',
      department: Department.HR,
      role: UserRole.HR_OFFICER,
      campus: 'Central',
      isActive: true,
    },
  })
  console.log('✅ Created HR Officer:', hrOfficer.email)
  
  // Create Compliance Officer
  const complianceOfficerPassword = await hashPassword('compofficer123')
  const complianceOfficer = await prisma.user.upsert({
    where: { email: 'compliance.officer@company.com' },
    update: {},
    create: {
      email: 'compliance.officer@company.com',
      passwordHash: complianceOfficerPassword,
      firstName: 'Olubukola',
      lastName: 'Koyenikan',
      employeeId: 'EMP-007',
      jobTitle: 'Compliance Officer',
      department: Department.COMPLIANCE,
      role: UserRole.COMPLIANCE_OFFICER,
      campus: 'Central',
      isActive: true,
    },
  })
  console.log('✅ Created Compliance Officer:', complianceOfficer.email)
  
  // Create sample employees
  const employees = [
    { email: 'timileyin.olaore@company.com', firstName: 'Timileyin', lastName: 'Olaore', employeeId: 'EMP-008', jobTitle: 'Software Engineer', department: Department.IT, campus: 'Central' },
    { email: 'obinna.uzorka@company.com', firstName: 'Obinna', lastName: 'Uzorka', employeeId: 'EMP-009', jobTitle: 'Data Analyst', department: Department.IT, campus: 'Central' },
    { email: 'thomas.micheal@company.com', firstName: 'Thomas', lastName: 'Micheal', employeeId: 'EMP-010', jobTitle: 'DevOps Engineer', department: Department.IT, campus: 'Central' },
    { email: 'ogechuku.okunna@company.com', firstName: 'Ogechuku', lastName: 'Okunna', employeeId: 'EMP-011', jobTitle: 'HR Specialist', department: Department.HR, campus: 'Lekki' },
    { email: 'abiodun@company.com', firstName: 'Abiodun', lastName: 'Adeyemi', employeeId: 'EMP-012', jobTitle: 'Communications Officer', department: Department.MARKETING, campus: 'Central' },
  ]
  
  const empPassword = await hashPassword('employee123')
  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        ...emp,
        passwordHash: empPassword,
        role: UserRole.EMPLOYEE,
        isActive: true,
      },
    })
  }
  console.log('✅ Created sample employees')
  
  // Create Accessory Types
  const accessoryTypes = [
    { name: 'Charger', code: 'CHR', description: 'Power adapter for laptops and devices' },
    { name: 'Keyboard', code: 'KEY', description: 'External keyboard' },
    { name: 'Mouse', code: 'MOU', description: 'External mouse' },
    { name: 'Headset', code: 'HED', description: 'Audio headset with microphone' },
    { name: 'Carrying Case', code: 'CAS', description: 'Protective carrying case or bag' },
    { name: 'Docking Station', code: 'DOC', description: 'Docking station for laptops' },
  ]
  
  for (const acc of accessoryTypes) {
    await prisma.accessoryType.upsert({
      where: { code: acc.code },
      update: {},
      create: acc,
    })
  }
  console.log('✅ Created accessory types')
  
  // Create sample assets from the Excel data
  const assets = [
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
      accessories: [
        { name: 'HP Charger', category: AssetCategory.CHARGER, accessoryId: 'ACC-CHR-001', brand: 'HP', model: 'HP Charger' },
      ],
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
      accessories: [
        { name: 'HP Charger', category: AssetCategory.CHARGER, accessoryId: 'CHARGER-CT:WFZJR0F1RCETNV', brand: 'HP', model: 'HP Charger' },
      ],
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
      assignedToId: (await prisma.user.findFirst({ where: { firstName: 'Debora' } }))?.id || complianceOfficer.id,
      assignedById: itOfficer.id,
      assignedAt: new Date('2026-07-29'),
      createdById: superAdmin.id,
      accessories: [
        { name: 'HP Charger', category: AssetCategory.CHARGER, accessoryId: 'CHARGER-CT:WEQJA0B1R9O5EI', brand: 'HP', model: 'HP Charger' },
      ],
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
      accessories: [
        { name: 'HP Charger', category: AssetCategory.CHARGER, accessoryId: 'CHARGER-CT:557C60BM5PF3CL', brand: 'HP', model: 'HP Charger' },
      ],
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
      assignedToId: (await prisma.user.findFirst({ where: { firstName: 'Abiodun' } }))?.id || itOfficer.id,
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
      assignedToId: (await prisma.user.findFirst({ where: { firstName: 'Obinna' } }))?.id || itOfficer.id,
      assignedById: itOfficer.id,
      assignedAt: new Date('2026-07-11'),
      createdById: superAdmin.id,
      accessories: [
        { name: 'HP Charger', category: AssetCategory.CHARGER, accessoryId: 'CT:WTYYV 2cored', brand: 'HP', model: 'HP Charger' },
      ],
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
      assignedToId: (await prisma.user.findFirst({ where: { firstName: 'Timileyin' } }))?.id || itOfficer.id,
      assignedById: itOfficer.id,
      assignedAt: new Date('2026-07-11'),
      createdById: superAdmin.id,
      accessories: [
        { name: 'HP Charger', category: AssetCategory.CHARGER, accessoryId: 'CT:WMVXQ', brand: 'HP', model: 'HP Charger' },
      ],
    },
  ]
  
  for (const assetData of assets) {
    const { accessories, ...asset } = assetData
    const createdAsset = await prisma.asset.upsert({
      where: { assetId: asset.assetId },
      update: {},
      create: asset,
    })
    
    // Create accessories
    if (accessories && accessories.length > 0) {
      for (const acc of accessories) {
        await prisma.asset.upsert({
          where: { accessoryId: acc.accessoryId },
          update: {},
          create: {
            ...acc,
            assetId: `AST-${Date.now().toString(36).toUpperCase()}-${acc.category}`,
            brand: acc.brand || createdAsset.brand,
            model: acc.model || acc.name,
            status: AssetStatus.ASSIGNED,
            assignedToId: createdAsset.assignedToId,
            assignedById: createdAsset.assignedById,
            assignedAt: createdAsset.assignedAt,
            parentAssetId: createdAsset.id,
            createdById: superAdmin.id,
          },
        })
      }
    }
  }
  console.log('✅ Created sample assets with accessories')
  
  // Create System Config
  await prisma.systemConfig.upsert({
    where: { key: 'high_value_threshold' },
    update: {},
    create: {
      key: 'high_value_threshold',
      value: 100000,
      category: 'approval',
      description: 'Threshold for high-value asset approval requiring Compliance Head',
    },
  })
  
  await prisma.systemConfig.upsert({
    where: { key: 'approval_reminder_days' },
    update: {},
    create: {
      key: 'approval_reminder_days',
      value: 3,
      category: 'approval',
      description: 'Days before sending approval reminder',
    },
  })
  
  await prisma.systemConfig.upsert({
    where: { key: 'email_notifications_enabled' },
    update: {},
    create: {
      key: 'email_notifications_enabled',
      value: true,
      category: 'notification',
      description: 'Enable email notifications for approvals and assignments',
    },
  })
  
  console.log('✅ Created system configs')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })