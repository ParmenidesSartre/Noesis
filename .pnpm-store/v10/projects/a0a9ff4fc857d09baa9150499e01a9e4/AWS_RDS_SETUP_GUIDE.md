# AWS RDS PostgreSQL Setup Guide

Complete guide for setting up AWS RDS PostgreSQL with read replicas for production deployment.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Application Layer                     │
│                       (NestJS Backend)                    │
└───────────┬─────────────────────────┬────────────────────┘
            │                         │
            │ Write Operations        │ Read Operations
            │ (INSERT, UPDATE,        │ (SELECT queries)
            │  DELETE, Transactions)  │
            ▼                         ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│  AWS RDS Primary     │───▶│   AWS RDS Read Replica       │
│  (Write Instance)    │    │   (Read-only Instance)       │
│                      │    │                              │
│  - All writes        │    │  - All reads                 │
│  - Consistent data   │    │  - Load distribution         │
│  - Higher cost       │    │  - Lower latency             │
└──────────────────────┘    │  - Horizontal scaling        │
                            └──────────────────────────────┘
```

---

## 📋 Environment Configuration

### Local Development
```bash
# .env (Local)
NODE_ENV=development
DATABASE_URL="postgresql://tuition_admin:dev_password_123@localhost:5432/tuition_centre_db?schema=public"
# No read replica needed locally
```

### Production
```bash
# .env (Production)
NODE_ENV=production

# Primary instance (writes)
DATABASE_URL="postgresql://username:password@tuition-primary.xxxxx.us-east-1.rds.amazonaws.com:5432/tuition_centre_db?schema=public&connection_limit=100&pool_timeout=30"

# Read replica (reads)
DATABASE_READ_REPLICA_URL="postgresql://username:password@tuition-replica.xxxxx.us-east-1.rds.amazonaws.com:5432/tuition_centre_db?schema=public&connection_limit=100&pool_timeout=30"
```

---

## 🔧 How It Works in Code

### Automatic Read/Write Splitting

The `PrismaService` automatically:
1. Uses **primary** for all write operations
2. Uses **read replica** for read operations (if configured)
3. Falls back to primary if no replica is configured

### Usage in Services

```typescript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ✅ Read from replica (if available)
  async findAll() {
    return await this.prisma.read((client) =>
      client.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
        },
      }),
    );
  }

  // ✅ Read from replica using getReadClient()
  async findOne(id: number) {
    return await this.prisma.getReadClient().user.findUnique({
      where: { id },
    });
  }

  // ✅ Write to primary
  async create(data: CreateUserDto) {
    return await this.prisma.write((client) =>
      client.user.create({ data }),
    );
  }

  // ✅ Write to primary using getWriteClient()
  async update(id: number, data: UpdateUserDto) {
    return await this.prisma.getWriteClient().user.update({
      where: { id },
      data,
    });
  }

  // ✅ Default behavior (for simple operations)
  async delete(id: number) {
    // Direct usage defaults to primary
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  // ✅ Transaction (always uses primary)
  async createWithProfile(userData: any, profileData: any) {
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      const profile = await tx.profile.create({
        data: { ...profileData, userId: user.id },
      });
      return { user, profile };
    });
  }
}
```

### Best Practices

```typescript
// ✅ DO: Use read replica for read operations
const users = await this.prisma.read((client) =>
  client.user.findMany()
);

// ✅ DO: Use primary for write operations
const user = await this.prisma.write((client) =>
  client.user.create({ data })
);

// ❌ DON'T: Read immediately after write from replica
// (may have replication lag)
const user = await this.prisma.write((client) =>
  client.user.create({ data })
);
// Wait a moment or read from primary
const freshUser = await this.prisma.user.findUnique({
  where: { id: user.id },
}); // Uses primary

// ✅ DO: Read from primary after critical writes
const user = await this.prisma.user.create({ data });
const verification = await this.prisma.getWriteClient().user.findUnique({
  where: { id: user.id },
}); // Guaranteed latest data
```

---

## 🚀 AWS RDS Setup Steps

### 1. Create Primary RDS Instance

```bash
# Via AWS Console
1. Go to RDS → Create database
2. Engine: PostgreSQL 15+
3. Templates: Production
4. DB instance identifier: tuition-centre-primary
5. Master username: Choose secure username
6. Master password: Generate strong password
7. Instance type: db.t4g.micro (start small, scale up)
8. Storage: 20 GB GP3 (SSD)
9. Enable storage autoscaling: Yes, max 100 GB
10. VPC: Create new or use existing
11. Public access: No (use VPN/bastion)
12. VPC security group: Create new
13. Enable automated backups: Yes
14. Backup retention: 7 days
15. Enable encryption: Yes
16. Enable Performance Insights: Yes (14 days free)
17. Enable Enhanced Monitoring: Yes (60 seconds)
18. Create database
```

### 2. Configure Security Group

```bash
# Allow PostgreSQL traffic from your application
1. Go to RDS → Databases → tuition-centre-primary
2. Click on VPC security group
3. Add inbound rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your application's security group
   - Description: Allow app to connect
```

### 3. Create Read Replica

```bash
# Via AWS Console
1. Go to RDS → Databases → tuition-centre-primary
2. Actions → Create read replica
3. DB instance identifier: tuition-centre-replica
4. Instance type: db.t4g.micro (can be smaller than primary)
5. Region: Same as primary
6. Multi-AZ: No (replica itself is a backup)
7. Public access: No
8. VPC security group: Same as primary
9. Enable Performance Insights: Yes
10. Create read replica
```

### 4. Get Connection Strings

```bash
# Primary endpoint
tuition-centre-primary.c1xyz123456.us-east-1.rds.amazonaws.com

# Replica endpoint
tuition-centre-replica.c1xyz123456.us-east-1.rds.amazonaws.com

# Construct URLs
DATABASE_URL="postgresql://username:password@tuition-centre-primary.c1xyz123456.us-east-1.rds.amazonaws.com:5432/tuition_centre_db?schema=public&connection_limit=100&pool_timeout=30"

DATABASE_READ_REPLICA_URL="postgresql://username:password@tuition-centre-replica.c1xyz123456.us-east-1.rds.amazonaws.com:5432/tuition_centre_db?schema=public&connection_limit=100&pool_timeout=30"
```

---

## 🔐 Security Best Practices

### 1. Use AWS Secrets Manager

```bash
# Store credentials in Secrets Manager
aws secretsmanager create-secret \
  --name tuition-centre/db/primary \
  --secret-string '{
    "username":"dbadmin",
    "password":"your-secure-password",
    "host":"tuition-centre-primary.xxxxx.us-east-1.rds.amazonaws.com",
    "port":"5432",
    "dbname":"tuition_centre_db"
  }'

# Application retrieves at runtime (recommended)
```

### 2. IAM Database Authentication (Optional)

```bash
# Enable IAM authentication on RDS instance
1. Modify RDS instance
2. Enable IAM DB authentication
3. Create IAM policy
4. Attach to application role
```

### 3. SSL/TLS Encryption

```bash
# Always use SSL in production
DATABASE_URL="postgresql://username:password@host:5432/db?schema=public&sslmode=require"

# For AWS RDS with certificate validation
DATABASE_URL="postgresql://username:password@host:5432/db?schema=public&sslmode=verify-full&sslrootcert=/path/to/rds-ca-bundle.pem"
```

---

## 📊 Monitoring & Performance

### CloudWatch Metrics to Monitor

```bash
1. CPUUtilization - Keep below 70%
2. DatabaseConnections - Monitor connection pool
3. FreeableMemory - Ensure sufficient memory
4. ReadLatency / WriteLatency - Track performance
5. ReplicaLag - Monitor replication delay (< 1 second ideal)
6. FreeStorageSpace - Prevent disk full
```

### Connection Pooling

```typescript
// Prisma automatically handles connection pooling
// Configure via connection string parameters:

DATABASE_URL="postgresql://user:pass@host:5432/db?
  schema=public&
  connection_limit=100&        // Max connections
  pool_timeout=30&             // Connection timeout (seconds)
  connect_timeout=10&          // Initial connection timeout
  pool_min=10&                 // Min connections in pool
  pool_max=100"                // Max connections in pool
```

---

## ⚠️ Important Considerations

### Replication Lag

```typescript
// Read replicas have slight delay (usually < 100ms)
// For critical reads after writes, use primary:

// ❌ DON'T: May get stale data
const user = await this.prisma.user.create({ data });
const check = await this.prisma.getReadClient().user.findUnique({
  where: { id: user.id },
}); // Might not exist yet!

// ✅ DO: Read from primary after write
const user = await this.prisma.user.create({ data });
const check = await this.prisma.getWriteClient().user.findUnique({
  where: { id: user.id },
}); // Guaranteed to exist
```

### When to Use Read Replica

```typescript
✅ Use read replica for:
- List views (findMany)
- Search queries
- Reports and analytics
- Dashboard stats
- Public-facing data

❌ Don't use read replica for:
- Immediately after a write
- Real-time consistency required
- Financial transactions
- Critical data verification
```

### Cost Optimization

```bash
1. Start small: db.t4g.micro ($13/month)
2. Enable storage autoscaling
3. Use read replica only if needed (high read traffic)
4. Monitor and scale up when needed
5. Use Reserved Instances for 40-60% savings
6. Enable automated backups (free up to DB size)
```

---

## 🧪 Testing

### Test Locally

```bash
# Start local PostgreSQL
docker-compose up -d

# No read replica needed
DATABASE_URL="postgresql://tuition_admin:dev_password_123@localhost:5432/tuition_centre_db"
```

### Test with Replica Simulation

```bash
# Run two PostgreSQL instances
docker run --name postgres-primary -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:15
docker run --name postgres-replica -e POSTGRES_PASSWORD=pass -p 5433:5432 -d postgres:15

# Configure .env
DATABASE_URL="postgresql://postgres:pass@localhost:5432/db"
DATABASE_READ_REPLICA_URL="postgresql://postgres:pass@localhost:5433/db"
```

---

## 🔄 Migration Strategy

### Step 1: Deploy without Read Replica

```bash
# Initial deployment
DATABASE_URL="primary-endpoint"
# No DATABASE_READ_REPLICA_URL

# Application runs in single-database mode
✅ All operations use primary
```

### Step 2: Add Read Replica

```bash
# After primary is stable
1. Create read replica in AWS
2. Wait for replication to complete
3. Add DATABASE_READ_REPLICA_URL to .env
4. Restart application

# Application automatically starts using replica
✅ Writes to primary
✅ Reads from replica
```

### Step 3: Monitor & Optimize

```bash
# Monitor metrics
- Check replica lag (should be < 1 second)
- Monitor connection counts
- Track query performance
- Adjust connection limits
```

---

## 🆘 Troubleshooting

### Replica Lag Too High

```bash
# Check replica lag
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;

# Solutions:
1. Increase replica instance size
2. Reduce write load on primary
3. Check network latency
4. Verify no long-running queries blocking replication
```

### Connection Pool Exhausted

```bash
# Error: "Too many connections"

# Solutions:
1. Increase connection_limit in DATABASE_URL
2. Scale up RDS instance
3. Check for connection leaks
4. Enable connection pooling properly
```

### SSL Connection Issues

```bash
# Error: "SSL connection required"

# Add to connection string:
?sslmode=require

# Or disable SSL (development only):
?sslmode=disable
```

---

## ✅ Checklist

### Local Development
- [ ] PostgreSQL running locally
- [ ] DATABASE_URL configured
- [ ] Migrations run successfully
- [ ] Application connects

### Production Deployment
- [ ] RDS primary instance created
- [ ] Security group configured
- [ ] Backups enabled
- [ ] Read replica created (if needed)
- [ ] DATABASE_URL set (primary)
- [ ] DATABASE_READ_REPLICA_URL set (replica)
- [ ] SSL enabled
- [ ] Monitoring enabled
- [ ] Alerts configured
- [ ] Application deployed and tested

---

## 📚 Additional Resources

- [AWS RDS PostgreSQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)

---

**Status**: ✅ Backend is configured for AWS RDS with read replica support!

**Result**:
- Local dev: Single database
- Production: Automatic read/write splitting
- Zero code changes needed between environments
- Graceful fallback if replica not configured
