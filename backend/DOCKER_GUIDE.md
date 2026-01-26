# 🐳 Docker Setup Guide

Complete guide for running the backend with Docker in development and production.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Commands](#docker-commands)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- pnpm 8.0+ (for local development)

### Start Development Environment

```bash
cd backend

# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Check health
curl http://localhost:3001/health

# Stop all services
docker-compose down
```

---

## 💻 Development Setup

### Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Compose Network              │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │PostgreSQL│  │  Redis   │  │ Backend  │ │
│  │  :5432   │  │  :6379   │  │  :3001   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│       │             │              │       │
└───────┼─────────────┼──────────────┼───────┘
        │             │              │
    (Volume)      (Volume)       (Volume)
  postgres_data  redis_data      ./logs
```

### Services

#### 1. PostgreSQL (Database)
- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **User**: `tuition_admin`
- **Password**: `dev_password_123`
- **Database**: `tuition_centre_db`
- **Health Check**: Every 10s

#### 2. Redis (Cache)
- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Password**: `dev_redis_password`
- **Persistence**: Enabled (AOF)
- **Health Check**: Every 10s

#### 3. Backend (NestJS)
- **Dockerfile**: `Dockerfile.dev`
- **Port**: `3001`
- **Hot Reload**: Enabled
- **Source**: Mounted as volume
- **Health Check**: Every 30s

### Development Workflow

#### 1. Start Services

```bash
# Start all services in detached mode
docker-compose up -d

# Or start with logs
docker-compose up
```

#### 2. Run Migrations

```bash
# Inside container
docker-compose exec backend pnpm prisma migrate dev

# Or from host (if pnpm installed)
pnpm prisma migrate dev
```

#### 3. Generate Prisma Client

```bash
# Inside container
docker-compose exec backend pnpm prisma generate

# Or from host
pnpm prisma generate
```

#### 4. View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# PostgreSQL only
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

#### 5. Execute Commands

```bash
# Open shell in backend container
docker-compose exec backend sh

# Run pnpm commands
docker-compose exec backend pnpm run lint
docker-compose exec backend pnpm run test

# Access PostgreSQL
docker-compose exec postgres psql -U tuition_admin -d tuition_centre_db

# Access Redis
docker-compose exec redis redis-cli -a dev_redis_password
```

#### 6. Rebuild After Changes

```bash
# Rebuild backend image
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build backend

# Force rebuild (no cache)
docker-compose build --no-cache backend
```

### Hot Reload

The development setup supports hot reload:
- Source code is mounted as a volume (`.:/app`)
- `node_modules` is an anonymous volume (not overridden)
- Changes to `.ts` files trigger automatic rebuild
- No need to restart container for code changes

**Files that require rebuild:**
- `package.json` - Run `docker-compose build backend`
- `Dockerfile.dev` - Run `docker-compose build backend`
- `docker-compose.yml` - Run `docker-compose up -d`

---

## 🏭 Production Deployment

### Production Docker Image

The production Dockerfile uses **multi-stage build** for optimization:

#### Stage 1: Dependencies
- Installs production dependencies only
- Minimizes final image size

#### Stage 2: Build
- Installs all dependencies (dev + prod)
- Generates Prisma Client
- Builds TypeScript to JavaScript

#### Stage 3: Production
- Uses Node.js Alpine (smallest)
- Copies only production dependencies
- Copies built application
- Runs as non-root user (security)
- Health check enabled
- Exposes port 3001

### Build Production Image

```bash
# Build production image
docker build -f Dockerfile -t tuition-backend:latest .

# Build with tag
docker build -f Dockerfile -t tuition-backend:1.0.0 .

# Run production container
docker run -d \
  --name tuition-backend \
  -p 3001:3001 \
  --env-file .env.production \
  tuition-backend:latest
```

### Production Environment Variables

Create `.env.production`:

```bash
# Node
NODE_ENV=production
PORT=3001

# Database (AWS RDS)
DATABASE_URL="postgresql://username:password@tuition-primary.xxxxx.us-east-1.rds.amazonaws.com:5432/tuition_centre_db?schema=public&sslmode=require"
DATABASE_READ_REPLICA_URL="postgresql://username:password@tuition-replica.xxxxx.us-east-1.rds.amazonaws.com:5432/tuition_centre_db?schema=public&sslmode=require"

# Redis (AWS ElastiCache)
REDIS_HOST=tuition-cache.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password
REDIS_TLS=true

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=info
```

### AWS Deployment Options

#### Option 1: AWS ECS/Fargate

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag tuition-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tuition-backend:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tuition-backend:latest

# Deploy to ECS (use AWS Console or CLI)
```

#### Option 2: AWS EC2

```bash
# On EC2 instance
git clone <your-repo>
cd backend

# Build production image
docker build -f Dockerfile -t tuition-backend:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 3: Kubernetes

```bash
# Build and push to registry
docker build -f Dockerfile -t your-registry/tuition-backend:latest .
docker push your-registry/tuition-backend:latest

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
```

---

## 📝 Docker Commands Reference

### Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild services
docker-compose build

# View logs
docker-compose logs -f [service]

# Execute command
docker-compose exec [service] [command]

# List running services
docker-compose ps

# Restart service
docker-compose restart [service]
```

### Docker Commands

```bash
# List containers
docker ps
docker ps -a

# List images
docker images

# Remove container
docker rm [container-id]

# Remove image
docker rmi [image-id]

# View logs
docker logs -f [container-id]

# Execute command
docker exec -it [container-id] [command]

# Inspect container
docker inspect [container-id]

# View resource usage
docker stats
```

### Cleanup Commands

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (DANGEROUS)
docker system prune -a --volumes
```

---

## 🔧 Troubleshooting

### Issue 1: Port Already in Use

**Error**: `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solution**:
```bash
# Find process using port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in docker-compose.yml
ports:
  - '3002:3001'  # Map to different host port
```

### Issue 2: Container Exits Immediately

**Error**: Container starts then exits

**Solution**:
```bash
# View logs
docker-compose logs backend

# Check for:
# - Missing environment variables
# - Database connection errors
# - Syntax errors in code
```

### Issue 3: Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check health
docker-compose exec postgres pg_isready -U tuition_admin

# Verify DATABASE_URL in docker-compose.yml
# Host should be 'postgres' (service name), not 'localhost'
DATABASE_URL=postgresql://tuition_admin:dev_password_123@postgres:5432/tuition_centre_db
```

### Issue 4: Hot Reload Not Working

**Error**: Code changes don't trigger reload

**Solution**:
```bash
# Ensure source is mounted as volume in docker-compose.yml
volumes:
  - .:/app
  - /app/node_modules

# Restart backend service
docker-compose restart backend

# Check NestJS is running in watch mode
docker-compose logs backend | grep "watch"
```

### Issue 5: Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
# Regenerate Prisma Client
docker-compose exec backend pnpm prisma generate

# Rebuild container
docker-compose build backend
docker-compose up -d backend
```

### Issue 6: Permission Denied

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# On Linux, fix file permissions
sudo chown -R $USER:$USER .

# Or run Docker as root (not recommended)
sudo docker-compose up
```

### Issue 7: Out of Memory

**Error**: Container crashes with OOM

**Solution**:
```bash
# Increase Docker memory limit (Docker Desktop settings)
# Or limit container memory in docker-compose.yml

deploy:
  resources:
    limits:
      memory: 512M
```

### Issue 8: Slow Build Times

**Solution**:
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Or enable in docker-compose.yml
COMPOSE_DOCKER_CLI_BUILD=1
DOCKER_BUILDKIT=1
```

---

## 🎯 Best Practices

### Development

1. ✅ Use named volumes for data persistence
2. ✅ Mount source code as volume for hot reload
3. ✅ Use health checks for all services
4. ✅ Keep containers running in detached mode
5. ✅ Use `docker-compose logs` to debug issues

### Production

1. ✅ Use multi-stage builds to minimize image size
2. ✅ Run as non-root user for security
3. ✅ Enable health checks
4. ✅ Set resource limits (CPU, memory)
5. ✅ Use environment variables for configuration
6. ✅ Never commit `.env.production` to Git
7. ✅ Use managed services (RDS, ElastiCache) instead of containers
8. ✅ Enable logging driver for centralized logs
9. ✅ Use orchestration (ECS, Kubernetes) for scaling
10. ✅ Implement CI/CD for automated deployments

### Security

1. ✅ Don't expose database ports in production
2. ✅ Use secrets management (AWS Secrets Manager)
3. ✅ Enable SSL/TLS for all connections
4. ✅ Scan images for vulnerabilities
5. ✅ Keep base images updated

---

## 📊 Image Size Optimization

### Development Image
- **Size**: ~1.2 GB (includes dev dependencies)
- **Build time**: ~2-3 minutes

### Production Image
- **Size**: ~350 MB (optimized)
- **Build time**: ~4-5 minutes
- **Layers**: Minimal (multi-stage build)

### Size Comparison

```bash
# Check image sizes
docker images | grep tuition

# Expected output:
# tuition-backend    latest (prod)    350MB
# tuition-backend    dev              1.2GB
```

---

## ✅ Checklist

### Development Setup
- [ ] Docker and Docker Compose installed
- [ ] `.env` file created (copy from `.env.example`)
- [ ] Run `docker-compose up -d`
- [ ] Run `docker-compose exec backend pnpm prisma migrate dev`
- [ ] Access http://localhost:3001/health

### Production Deployment
- [ ] `.env.production` created with real credentials
- [ ] AWS RDS database configured
- [ ] AWS ElastiCache (Redis) configured
- [ ] SSL certificates configured
- [ ] Build production image: `docker build -f Dockerfile .`
- [ ] Push to container registry (ECR, Docker Hub)
- [ ] Deploy to orchestration platform
- [ ] Configure load balancer
- [ ] Set up monitoring and alerts

---

**Status**: ✅ Docker configuration complete!

**Next Steps**: Start development or deploy to production.
