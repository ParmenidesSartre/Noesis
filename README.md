# Tuition Centre Management System

A comprehensive SAAS platform for managing tuition centres, covering student enrollment, academic management, billing, and analytics.

## 📋 Project Structure

```
.
├── frontend/          # Next.js 14 frontend application
├── backend/           # NestJS backend API
├── docs/             # Complete project documentation
└── README.md         # This file
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT + Passport.js
- **Documentation**: Swagger/OpenAPI

### Infrastructure
- **Container**: Docker + Docker Compose
- **Version Control**: Git

## 📁 Database Schema

The Prisma schema includes 18 models covering:
- **User Management**: Users, Roles (Super Admin, Branch Admin, Teacher, Student, Parent)
- **Branch Management**: Multi-branch support with data isolation
- **Student Management**: Complete student lifecycle (enrollment, profiles, medical info)
- **Teacher Management**: Teacher profiles, qualifications, specializations
- **Academic**: Courses, Classes, Rooms, Enrollments
- **Attendance**: Multiple marking methods with status tracking
- **Assessment**: Assignments, Grades, Progress tracking
- **Billing**: Fees, Invoices, Payments with multiple payment methods

## 🛠️ Getting Started

### Prerequisites

Make sure you have installed:
- Node.js 18+ or 20+
- pnpm (recommended) or npm
- Docker Desktop
- Git

### 1. Clone the Repository

```bash
cd c:\Users\USER\Desktop\Projects\01
```

### 2. Start Database Services

```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

### 3. Set Up Backend

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
pnpm run start:dev
```

Backend will be running on: http://localhost:3001
API Documentation: http://localhost:3001/api/docs

### 4. Set Up Frontend

```bash
cd frontend

# Start development server
pnpm run dev
```

Frontend will be running on: http://localhost:3000

## 📚 API Documentation

Once the backend is running, visit http://localhost:3001/api/docs for interactive API documentation powered by Swagger.

## 🗄️ Database Management

### View Database with Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens at: http://localhost:5555

### Run Migrations

```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Reset Database (⚠️ Deletes all data)

```bash
cd backend
npx prisma migrate reset
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://tuition_admin:dev_password_123@localhost:5432/tuition_centre_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
JWT_EXPIRATION=1d
JWT_REFRESH_EXPIRATION=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_PREFIX=api/v1
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 📖 Documentation

Complete project documentation is available in the [docs/](docs/) directory:

- [00_PROJECT_INDEX.md](docs/00_PROJECT_INDEX.md) - Master index of all documentation
- [01_USER_MANAGEMENT.md](docs/01_USER_MANAGEMENT.md) - User management specifications
- [02_STUDENT_MANAGEMENT.md](docs/02_STUDENT_MANAGEMENT.md) - Student management specifications
- [03_CLASS_SCHEDULE_MANAGEMENT.md](docs/03_CLASS_SCHEDULE_MANAGEMENT.md) - Class & schedule management
- [04_ATTENDANCE_SYSTEM.md](docs/04_ATTENDANCE_SYSTEM.md) - Attendance tracking
- [05_BILLING_PAYMENT.md](docs/05_BILLING_PAYMENT.md) - Billing & payment processing
- [06_ACADEMIC_MANAGEMENT.md](docs/06_ACADEMIC_MANAGEMENT.md) - Academic features
- [07_COMMUNICATION_HUB.md](docs/07_COMMUNICATION_HUB.md) - Communication system
- [08_LEARNING_MATERIALS_RESOURCES.md](docs/08_LEARNING_MATERIALS_RESOURCES.md) - Learning resources
- [09_ANALYTICS_REPORTING.md](docs/09_ANALYTICS_REPORTING.md) - Analytics & reporting
- [10_ADMINISTRATIVE_TOOLS.md](docs/10_ADMINISTRATIVE_TOOLS.md) - Admin tools
- [11_MOBILE_APPLICATIONS.md](docs/11_MOBILE_APPLICATIONS.md) - Mobile app specifications
- [12_ADDITIONAL_FEATURES.md](docs/12_ADDITIONAL_FEATURES.md) - Additional features
- [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) - 44-week development roadmap
- [DEPENDENCY_GRAPH_DETAILED.md](docs/DEPENDENCY_GRAPH_DETAILED.md) - Feature dependencies
- [PROJECT_TIMELINE_GANTT.md](docs/PROJECT_TIMELINE_GANTT.md) - Week-by-week timeline
- [RECOMMENDED_TECH_STACK.md](docs/RECOMMENDED_TECH_STACK.md) - Tech stack rationale
- [QUICK_START_GUIDE.md](docs/QUICK_START_GUIDE.md) - Quick start guide

## 🏗️ Current Architecture Status

### ✅ Completed Setup

- [x] Project folder structure (frontend, backend, docs)
- [x] Frontend with Next.js 14 + TypeScript + Tailwind CSS
- [x] Backend with NestJS + Prisma + PostgreSQL
- [x] Docker Compose for PostgreSQL and Redis
- [x] Complete Prisma schema with 18 models
- [x] Environment configuration files
- [x] NestJS modules: Auth, Users, Branches, Prisma
- [x] Git repository initialized
- [x] CORS and validation configured
- [x] Swagger API documentation setup

### 🔄 Next Steps (Phase 0 - Week 1-4)

1. **Authentication Implementation** (Week 1-2)
   - JWT strategy setup
   - Login/Register endpoints
   - Password hashing with bcrypt
   - Auth guards and decorators

2. **User Management** (Week 2-3)
   - User CRUD operations
   - Role-based access control
   - User profile management

3. **Branch Management** (Week 3-4)
   - Branch CRUD operations
   - Multi-tenant data isolation
   - Branch assignment logic

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

### Frontend Tests
```bash
cd frontend
pnpm run test
```

## 📦 Build for Production

### Backend
```bash
cd backend
pnpm run build
pnpm run start:prod
```

### Frontend
```bash
cd frontend
pnpm run build
pnpm run start
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if Docker containers are running
cd backend
docker-compose ps

# Restart containers
docker-compose restart

# View logs
docker-compose logs -f postgres
```

### Port Already in Use
```bash
# Find process using port 3000 (frontend)
npx kill-port 3000

# Find process using port 3001 (backend)
npx kill-port 3001
```

### Prisma Errors
```bash
cd backend

# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## 📊 Project Statistics

- **Total Duration**: 44 weeks (11 months)
- **Development Phases**: 6 (Foundation + 5 phases)
- **Major Features**: 12
- **Sub-Features**: 100+
- **Database Tables**: 18
- **User Roles**: 5
- **Team Size**: 7-18 people (varies by phase)

## 🎯 MVP Milestone

MVP can be launched after **Week 16** with:
- User authentication and management
- Branch management
- Student and teacher management
- Course catalog
- Class scheduling
- Student enrollment
- Basic billing and invoicing
- Payment processing
- Attendance tracking

## 📝 License

This project is private and proprietary.

## 👥 Team

For questions or issues, contact the project team.

---

**Status**: Architecture Setup Complete ✅
**Last Updated**: 2026-01-26
**Next Phase**: Phase 0 - Authentication Implementation
