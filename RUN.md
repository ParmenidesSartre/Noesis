# How to Run with Docker

## Simple - One Command

```bash
# Start everything (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

## Features

✅ **Hot reload** - Code changes auto-update
✅ **PostgreSQL** - Database included
✅ **Source mounted** - Edit code directly
✅ **Development mode** - Full debugging

## Useful Commands

```bash
# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Rebuild after package.json changes
docker-compose down
docker-compose up -d --build

# Access backend shell
docker exec -it noesis-backend sh

# Run Prisma commands
docker exec -it noesis-backend npx prisma studio

# Clean everything (removes database)
docker-compose down -v
```

## First Time Setup

Wait 2-3 minutes for:
1. Database to initialize
2. Dependencies to install
3. Backend migrations to run
4. Frontend to compile

Then visit http://localhost:3000

## Alternative: Run Locally

If you prefer running without Docker:

```bash
# Start only database
cd backend
docker-compose -f docker-compose.infra.yml up -d

# Run backend locally
cd backend
pnpm install
npx prisma generate
npx prisma migrate dev
pnpm run start:dev

# Run frontend locally (in another terminal)
cd frontend
pnpm install
pnpm run dev
```
