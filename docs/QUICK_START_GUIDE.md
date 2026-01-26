# Quick Start Guide - Day 1 Setup

**Goal:** Get development environment running in 1 day

---

## ☑️ Prerequisites Checklist

Install these before starting:

```bash
# Check Node.js version (need 18+)
node --version  # Should be v18+ or v20+

# Install if needed
# Download from: https://nodejs.org/

# Install pnpm (faster than npm)
npm install -g pnpm

# Install NestJS CLI
npm install -g @nestjs/cli

# Install Prisma CLI
npm install -g prisma

# Install Git
git --version

# Install Docker (for local PostgreSQL)
docker --version
```

---

## 🚀 Project Setup (2 hours)

### Step 1: Create Project Structure (5 minutes)

```bash
mkdir tuition-centre-saas
cd tuition-centre-saas

# Create folders
mkdir frontend backend mobile docs

# Initialize Git
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo ".DS_Store" >> .gitignore
```

### Step 2: Setup Frontend (30 minutes)

```bash
cd frontend

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install essential packages
pnpm install @tanstack/react-query @tanstack/react-table zustand
pnpm install react-hook-form @hookform/resolvers zod
pnpm install axios date-fns
pnpm install lucide-react class-variance-authority clsx tailwind-merge

# Install shadcn/ui
npx shadcn-ui@latest init
# Choose: Default, Zinc, CSS variables

# Add essential components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

### Step 3: Setup Backend (30 minutes)

```bash
cd ../backend

# Create NestJS app
nest new . --package-manager pnpm

# Install essential packages
pnpm install @nestjs/config @nestjs/jwt @nestjs/passport
pnpm install @prisma/client
pnpm install passport passport-jwt passport-local
pnpm install bcrypt class-validator class-transformer
pnpm install @nestjs/swagger

# Dev dependencies
pnpm install -D prisma @types/passport-jwt @types/passport-local @types/bcrypt

# Initialize Prisma
npx prisma init
```

### Step 4: Setup Database (30 minutes)

**Option A: Docker (Recommended for Development)**

```bash
# Create docker-compose.yml in backend folder
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: tuition_admin
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: tuition_centre_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Start database
docker-compose up -d

# Check if running
docker-compose ps
```

**Option B: Local PostgreSQL**
- Download and install PostgreSQL 15
- Create database: `tuition_centre_db`
- Create user: `tuition_admin`

### Step 5: Configure Environment Variables (10 minutes)

**Backend `.env` file:**
```bash
cd backend

cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://tuition_admin:dev_password_123@localhost:5432/tuition_centre_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=1d

# App
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
EOF
```

**Frontend `.env.local` file:**
```bash
cd ../frontend

cat > .env.local << 'EOF'
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
```

### Step 6: Create Initial Database Schema (20 minutes)

```bash
cd backend

# Edit prisma/schema.prisma
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SUPER_ADMIN
  BRANCH_ADMIN
  TEACHER
  STUDENT
  PARENT
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String
  role      Role
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  branch    Branch?  @relation(fields: [branchId], references: [id])
  branchId  Int?

  @@map("users")
}

model Branch {
  id        Int      @id @default(autoincrement())
  name      String
  code      String   @unique
  address   String?
  phone     String?
  email     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  users     User[]

  @@map("branches")
}
EOF

# Run migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio to see your database
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🏗️ Project Structure Setup (30 minutes)

### Backend Structure

```bash
cd backend/src

# Create module structure
nest g module auth
nest g module users
nest g module branches

nest g service auth
nest g service users
nest g service branches

nest g controller auth
nest g controller users
nest g controller branches

# Create Prisma service
mkdir prisma
cat > prisma/prisma.service.ts << 'EOF'
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
EOF

cat > prisma/prisma.module.ts << 'EOF'
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
EOF
```

### Frontend Structure

```bash
cd ../../frontend

# Create folder structure
mkdir -p app/dashboard
mkdir -p app/login
mkdir -p app/api
mkdir -p components/ui
mkdir -p components/layout
mkdir -p lib/api
mkdir -p lib/hooks
mkdir -p lib/stores
mkdir -p types
```

---

## ✅ Verify Setup (10 minutes)

### Test Backend

```bash
cd backend

# Start backend server
pnpm run start:dev

# Should see:
# [Nest] Application successfully started on http://localhost:3001
```

Open browser: http://localhost:3001 (should see "Hello World!")

### Test Frontend

```bash
cd frontend

# Start frontend server
pnpm run dev

# Should see:
# - Local: http://localhost:3000
```

Open browser: http://localhost:3000 (should see Next.js welcome page)

### Test Database

```bash
cd backend

# Open Prisma Studio
npx prisma studio

# Should open http://localhost:5555
# You should see your tables (users, branches)
```

---

## 📝 First Feature: Authentication (4 hours)

### Backend: JWT Auth (2 hours)

```typescript
// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN', // First user is admin
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
```

```typescript
// backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

export class RegisterDto {
  email: string;
  password: string;
  name: string;
}

export class LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
```

### Frontend: Login Page (2 hours)

```typescript
// frontend/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('Login failed')

      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      router.push('/dashboard')
    } catch (error) {
      alert('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Tuition Centre</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🎯 End of Day 1 Checklist

- ✅ Development environment set up
- ✅ Frontend (Next.js) running
- ✅ Backend (NestJS) running
- ✅ Database (PostgreSQL) running
- ✅ Prisma working
- ✅ Basic authentication working
- ✅ Login page created
- ✅ Can create first admin user
- ✅ Can login and get JWT token

---

## 📅 Next Steps (Day 2-7)

### Day 2: User Management
- Create users CRUD
- Role-based access control
- User listing page

### Day 3: Branch Management
- Branch CRUD
- Branch selection
- Multi-tenant setup

### Day 4: Student Management
- Student registration
- Parent linking
- Student profiles

### Day 5: Teacher Management
- Teacher profiles
- Subject assignment
- Availability

### Day 6-7: Classes
- Course catalog
- Class creation
- Schedule builder

---

## 🆘 Troubleshooting

### Database connection error
```bash
# Check if Docker is running
docker ps

# Restart database
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Prisma errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

---

## 📚 Useful Commands Reference

```bash
# Backend
cd backend
pnpm run start:dev          # Start in watch mode
pnpm run build              # Build for production
pnpm run test               # Run tests
npx prisma studio           # Open database GUI
npx prisma migrate dev      # Create migration
npx prisma generate         # Regenerate Prisma client
nest g resource <name>      # Generate module, service, controller

# Frontend
cd frontend
pnpm run dev                # Start dev server
pnpm run build              # Build for production
pnpm run start              # Start production server
pnpm run lint               # Lint code

# Database
docker-compose up -d        # Start database
docker-compose down         # Stop database
docker-compose logs -f      # View logs
```

---

**You're now ready to start building! 🚀**

**Next:** Follow the week-by-week plan in [PROJECT_TIMELINE_GANTT.md](PROJECT_TIMELINE_GANTT.md)

