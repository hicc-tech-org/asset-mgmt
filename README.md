# Asset Management Platform

A modern IT Asset Management Platform to replace manual asset tracking processes.

## Features

- **Asset Management**: Full lifecycle tracking of IT assets (laptops, phones, accessories)
- **Accessory Tracking**: Individual accessory IDs for easy reassignment (chargers, keyboards, mice, headsets, carrying cases, docking stations)
- **Approval Chain**: Multi-level approval workflows with HR, IT, and Compliance departments
- **Audit Trail**: Complete audit logging with timestamps, actors, and before/after states
- **Role-Based Access Control**: Superadmin, Admin, Department Heads, Officers, and Employees
- **Asset Custody & Acknowledgement**: Digital acknowledgement statements for asset issuance and return
- **User Management**: Superadmin can invite users with department, role, and privilege assignments

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HttpOnly cookies
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database URL and JWT secret.

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Default Credentials

After seeding, you can login with:

- **Super Admin**: admin@company.com / admin123
- **HR Head**: hr.head@company.com / hrhead123
- **IT Head**: it.head@company.com / ithead123
- **Compliance Head**: compliance.head@company.com / comphead123
- **IT Officer**: it.officer@company.com / itofficer123
- **HR Officer**: hr.officer@company.com / hroffice123
- **Compliance Officer**: compliance.officer@company.com / comportofficer123
- **Employees**: employee123

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── assets/       # Asset management endpoints
│   │   ├── users/        # User management endpoints
│   │   ├── approvals/    # Approval workflow endpoints
│   │   └── audit-logs/   # Audit trail endpoints
│   ├── auth/             # Auth pages (login)
│   ├── dashboard/        # Main dashboard
│   ├── assets/           # Asset pages
│   ├── users/            # User management pages
│   ├── approvals/        # Approval pages
│   ├── audit-logs/       # Audit log pages
│   └── admin/            # Admin panel
├── components/
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   ├── tables/           # Table components
│   └── layout/           # Layout components (sidebar, header)
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   ├── auth.ts           # Auth utilities
│   ├── audit.ts          # Audit logging
│   └── utils.ts          # Utility functions
└── types/                # TypeScript types

prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Database seeding
```

## Key Features Implementation

### Asset Management
- CRUD operations for assets
- Asset assignment and return workflows
- Accessory tracking with unique IDs
- Asset condition tracking (New, Good, Fair, Damaged)
- Status management (Available, Assigned, Maintenance, Retired, Damaged, Lost)

### Approval Chain
- Multi-level approval workflows
- HR approval for all asset requests
- IT approval for IT assets and accessories
- Compliance approval for high-value assets (>₦100,000)
- Priority-based processing (Low, Medium, High, Urgent)

### Audit Trail
- Automatic logging of all state-changing operations
- Captures: actor, timestamp, entity, before/after state, description
- Filterable by entity type, action, actor, date range
- Compliance-ready audit reports

### User Management
- Superadmin user invitation with department/role assignment
- Department-based organization (HR, IT, Compliance, Finance, Operations, Marketing, Sales)
- Role hierarchy with specific permissions
- Employee ID tracking and campus location

### Asset Custody & Acknowledgement
- Digital acknowledgement statements
- Standardized custody agreement text
- Signature capture (typed name)
- Witness support
- Audit trail integration

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## License

MIT