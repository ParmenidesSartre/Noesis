# 🏢 Multi-Tenant SAAS Architecture

**Platform**: Noesis - Tuition Centre Management SAAS
**Tenant Model**: Organization-based (each tuition centre is a separate tenant)

---

## 📋 Architecture Overview

### Current Problem
The current schema treats this as a single-organization system with branches, but Noesis is a **SAAS platform** where:
- Each **tuition centre** is a separate **tenant/organization**
- Multiple tuition centres use the same platform
- Complete data isolation between tenants
- Each tenant has its own users, students, branches, etc.

### Solution: Organization-Based Multi-Tenancy

```
┌─────────────────────────────────────────────────────────┐
│                    Noesis Platform                       │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼─────────┐
│ Organization 1 │  │ Organization 2 │  │ Organization 3 │
│ (ABC Academy)  │  │ (XYZ Centre)   │  │ (123 Learning) │
└───────┬────────┘  └───────┬────────┘  └──────┬─────────┘
        │                   │                   │
   ┌────┴────┐         ┌────┴────┐        ┌────┴────┐
   │ Users   │         │ Users   │        │ Users   │
   │ Branches│         │ Branches│        │ Branches│
   │ Students│         │ Students│        │ Students│
   │ Teachers│         │ Teachers│        │ Teachers│
   │ Classes │         │ Classes │        │ Classes │
   └─────────┘         └─────────┘        └─────────┘
```

---

## 🗄️ Database Schema Changes Required

### 1. Add Organization Model

```prisma
model Organization {
  id          Int       @id @default(autoincrement())
  name        String    // "ABC Tuition Centre"
  slug        String    @unique // "abc-tuition" (for subdomain)
  email       String    @unique
  phone       String?
  address     String?

  // Subscription
  plan        SubscriptionPlan  @default(FREE_TRIAL)
  planStatus  PlanStatus        @default(TRIAL)
  trialEndsAt DateTime?

  // Branding
  logo        String?
  primaryColor String?          @default("#3b82f6")

  // Settings
  timezone    String            @default("Asia/Singapore")
  currency    String            @default("SGD")

  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  users       User[]
  branches    Branch[]
  students    Student[]
  teachers    Teacher[]
  courses     Course[]
  classes     Class[]
  invoices    Invoice[]
  payments    Payment[]

  @@map("organizations")
  @@index([slug])
  @@index([email])
}

enum SubscriptionPlan {
  FREE_TRIAL    // 14-day trial
  STARTER       // Up to 50 students
  PROFESSIONAL  // Up to 200 students
  ENTERPRISE    // Unlimited
}

enum PlanStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
  SUSPENDED
}
```

### 2. Update User Model

```prisma
model User {
  id             Int      @id @default(autoincrement())
  email          String   @unique
  password       String
  name           String

  // Multi-tenant
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  role           Role
  phone          String?
  isActive       Boolean  @default(true)

  // Remove branchId (users belong to org, not specific branch)

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  teacher        Teacher?
  student        Student?
  parent         Parent?

  @@map("users")
  @@index([email])
  @@index([organizationId])
  @@unique([email, organizationId]) // Email unique per organization
}
```

### 3. Update All Models

**Add organizationId to ALL tenant-specific models:**
- Branch
- Student
- Teacher
- Course
- Class
- Enrollment
- Attendance
- Assignment
- Grade
- Fee
- Invoice
- Payment

**Example:**
```prisma
model Student {
  id             Int      @id @default(autoincrement())

  // Multi-tenant - CRITICAL
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  userId         Int      @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // ... rest of fields

  @@map("students")
  @@index([organizationId])
}
```

---

## 🚀 Onboarding Flow

### Step 1: Organization Registration

```
┌─────────────────────────────────┐
│  Noesis Platform Landing Page   │
│                                 │
│  [Sign Up] [Login]              │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│   Organization Registration     │
│                                 │
│  Organization Name: ________    │
│  Email: ___________________     │
│  Phone: ___________________     │
│  Country: _________________     │
│                                 │
│  [Continue]                     │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│   Choose Your Plan              │
│                                 │
│  ○ Starter ($49/month)          │
│  ○ Professional ($99/month)     │
│  ○ Enterprise (Custom)          │
│                                 │
│  ✓ 14-day free trial            │
│  [Start Free Trial]             │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│   Admin Account Setup           │
│                                 │
│  Your Name: _______________     │
│  Email: ___________________     │
│  Password: ________________     │
│  Confirm Password: ________     │
│                                 │
│  [Create Account]               │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│   Email Verification            │
│                                 │
│  We sent a verification link    │
│  to your email.                 │
│                                 │
│  [Resend Email] [Continue]      │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│   Welcome to Noesis!            │
│                                 │
│  Your subdomain:                │
│  abc-tuition.noesis.app         │
│                                 │
│  [Go to Dashboard]              │
└─────────────────────────────────┘
```

### Step 2: Initial Setup Wizard

After onboarding, guide admin through:
1. **Create First Branch** (if multi-location)
2. **Add Teachers** (invite or create)
3. **Create Courses** (subjects offered)
4. **Setup Fee Structure**
5. **Import Students** (CSV or manual)

---

## 🔐 Authentication Strategy

### Multi-Tenant Authentication

1. **Subdomain-Based** (Recommended)
   ```
   abc-tuition.noesis.app/login
   xyz-centre.noesis.app/login
   ```
   - Automatic tenant detection
   - Clean separation
   - Professional appearance

2. **Login with Organization Slug**
   ```
   noesis.app/login

   Email: admin@example.com
   Organization: abc-tuition
   Password: ********
   ```

3. **Single Sign-On** (Future)
   - Google Workspace
   - Microsoft Azure AD

### JWT Token Structure

```typescript
{
  userId: 1,
  email: "admin@example.com",
  organizationId: 5,
  organizationSlug: "abc-tuition",
  role: "SUPER_ADMIN",
  iat: 1234567890,
  exp: 1234654290
}
```

---

## 🛡️ Data Isolation Strategy

### 1. Prisma Middleware Approach

```typescript
// prisma.service.ts
async onModuleInit() {
  await this.$connect();

  // Automatic tenant filtering
  this.$use(async (params, next) => {
    // Get organizationId from context
    const organizationId = getCurrentOrganizationId();

    if (!organizationId) {
      throw new UnauthorizedException('No organization context');
    }

    // Inject organizationId into all queries
    if (params.model !== 'Organization') {
      if (params.action === 'findMany' || params.action === 'findFirst') {
        params.args.where = {
          ...params.args.where,
          organizationId,
        };
      }

      if (params.action === 'create' || params.action === 'update') {
        params.args.data = {
          ...params.args.data,
          organizationId,
        };
      }
    }

    return next(params);
  });
}
```

### 2. Request Context

```typescript
// Organization context from JWT
@Injectable()
export class OrganizationContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Set organization context from JWT
    AsyncLocalStorage.run({ organizationId: user.organizationId }, () => {
      return next.handle();
    });
  }
}
```

### 3. Row-Level Security (PostgreSQL)

```sql
-- Enable RLS on all tenant tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their organization's data
CREATE POLICY tenant_isolation ON students
  USING (organization_id = current_setting('app.current_organization_id')::int);
```

---

## 📊 Subscription & Billing

### Plans

| Plan | Price | Students | Branches | Features |
|------|-------|----------|----------|----------|
| **Starter** | $49/mo | 50 | 1 | Basic features |
| **Professional** | $99/mo | 200 | 5 | Advanced features |
| **Enterprise** | Custom | Unlimited | Unlimited | All features + support |

### Free Trial
- 14 days free
- No credit card required
- Full feature access
- Auto-downgrade to Free plan if not upgraded

### Billing Integration
- Stripe (recommended)
- PayPal
- Manual invoicing (Enterprise)

---

## 🌐 Domain Strategy

### Subdomain Structure

```
Platform Domain: noesis.app

Tenant Subdomains:
- abc-tuition.noesis.app
- xyz-centre.noesis.app
- learning-hub.noesis.app

Admin Panel:
- admin.noesis.app (platform admin)
- dashboard.abc-tuition.noesis.app (tenant dashboard)
```

### Custom Domains (Enterprise)

```
Tenant can use: academy.example.com
Points to: abc-tuition.noesis.app
```

---

## 🔄 Migration Strategy

### Phase 1: Database Schema Update
1. Add Organization model
2. Add organizationId to all models
3. Create migration

### Phase 2: Seed Default Organization
1. Create default organization for existing data
2. Assign all existing records to default org

### Phase 3: Onboarding System
1. Registration endpoint
2. Email verification
3. Subdomain creation
4. Setup wizard

### Phase 4: Multi-Tenant Enforcement
1. Add Prisma middleware
2. Update all queries to include organizationId
3. Add tenant isolation tests

---

## 🎯 Implementation Order

### Week 1: Database & Core
- [ ] Update Prisma schema with Organization model
- [ ] Add organizationId to all models
- [ ] Create and run migrations
- [ ] Update PrismaService with tenant middleware
- [ ] Create Organization module (CRUD)

### Week 2: Authentication
- [ ] Update JWT strategy to include organizationId
- [ ] Create registration flow (organization + admin user)
- [ ] Email verification system
- [ ] Subdomain detection middleware
- [ ] Login with organization context

### Week 3: Onboarding
- [ ] Registration API endpoints
- [ ] Email templates for verification
- [ ] Setup wizard API
- [ ] Subdomain generation logic
- [ ] Trial period management

### Week 4: Subscription
- [ ] Plan model and logic
- [ ] Stripe integration
- [ ] Subscription status checking middleware
- [ ] Upgrade/downgrade flows
- [ ] Billing webhooks

---

## 🧪 Testing Considerations

### Multi-Tenant Tests

```typescript
describe('Multi-Tenant Isolation', () => {
  it('should not allow access to other organization data', async () => {
    const org1 = await createOrganization({ name: 'Org 1' });
    const org2 = await createOrganization({ name: 'Org 2' });

    const user1 = await createUser({ organizationId: org1.id });
    const student1 = await createStudent({ organizationId: org1.id });

    const user2 = await createUser({ organizationId: org2.id });

    // User2 should NOT see student1
    const result = await getStudentsAsUser(user2);
    expect(result).not.toContainEqual(student1);
  });
});
```

---

## 🚨 Critical Security Rules

1. **NEVER query without organizationId** (except Organization table)
2. **ALWAYS verify user belongs to organization** in authentication
3. **NEVER trust organizationId from request body** (get from JWT)
4. **ALWAYS use Prisma middleware** for automatic filtering
5. **Test cross-tenant access** in all E2E tests

---

## 📈 Scalability Considerations

### Database Sharding (Future)

When you have 1000+ organizations:
- Shard by organizationId
- Each shard contains subset of organizations
- Distributed across multiple databases

### Caching Strategy

```typescript
// Cache key includes organizationId
const cacheKey = `org:${organizationId}:students:all`;
```

### Performance

- Index on organizationId in ALL tables
- Partition tables by organizationId (PostgreSQL 10+)
- Monitor query performance per organization

---

## ✅ Checklist

### Before Implementation
- [ ] Review this architecture document
- [ ] Confirm subscription plans and pricing
- [ ] Decide on subdomain vs. slug-based login
- [ ] Choose payment provider (Stripe recommended)
- [ ] Design email templates

### During Implementation
- [ ] Follow implementation order (Week 1-4)
- [ ] Write tests for tenant isolation
- [ ] Document API endpoints
- [ ] Create setup wizard UI flow

### After Implementation
- [ ] Test with multiple organizations
- [ ] Verify complete data isolation
- [ ] Load test with 100+ orgs
- [ ] Security audit

---

**Next Step**: Update Prisma schema with Organization model and multi-tenant support.
