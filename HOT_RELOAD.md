# Hot Reload Configuration

## ✅ Hot Reload is ENABLED

Your development environment is configured for automatic hot reload. Changes to your code will automatically refresh without manual restarts!

## How It Works

### Frontend (Next.js)
- **Auto-reload**: Changes to `.tsx`, `.ts`, `.css` files trigger instant refresh
- **Fast Refresh**: React components update without losing state
- **Polling**: Configured to check for changes every 1 second (Docker-optimized)

### Backend (NestJS)
- **Watch mode**: Automatically restarts on `.ts` file changes
- **Fast compilation**: TypeScript compiles incrementally
- **Instant updates**: API endpoints reflect changes immediately

## File Mounting

```yaml
# Your source code is mounted as volumes:
frontend:
  volumes:
    - ./frontend:/app          # Hot reload enabled
    - frontend_node_modules    # Isolated from host

backend:
  volumes:
    - ./backend:/app           # Hot reload enabled
    - backend_node_modules     # Isolated from host
```

## Development Workflow

1. **Start Docker**: `docker-compose up`
2. **Edit files**: Make changes to any `.ts`, `.tsx`, `.css` files
3. **See changes**: Browser/API auto-updates (no manual restart needed!)

### Frontend Changes
- Edit `frontend/app/**/*.tsx` → Browser auto-refreshes
- Edit `frontend/components/**/*.tsx` → Instant update
- Edit `frontend/app/globals.css` → Styles update live

### Backend Changes
- Edit `backend/src/**/*.ts` → Server auto-restarts (~2-3 seconds)
- Edit `backend/src/**/*.service.ts` → API updates automatically

## Troubleshooting

### If hot reload stops working:

**Frontend not updating?**
```bash
# Restart frontend container
docker-compose restart frontend
```

**Backend not restarting?**
```bash
# Restart backend container
docker-compose restart backend
```

**Nuclear option (clears everything):**
```bash
docker-compose down
docker-compose up --build
```

## What DON'T Need Restart

✅ Component files (`.tsx`, `.ts`)
✅ Style files (`.css`)
✅ API routes & controllers
✅ Services & modules
✅ Most configuration changes

## What NEEDS Manual Restart

❌ `package.json` changes (new dependencies)
❌ Environment variables (`.env` files)
❌ `docker-compose.yml` changes
❌ Dockerfile modifications
❌ Database schema changes (run `npx prisma migrate dev`)

## Performance

- **Frontend rebuild**: ~300-1000ms
- **Backend restart**: ~2-3 seconds
- **Full reload**: Only when necessary

## Logs

Watch live logs:
```bash
# All services
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend
```

---

**Status**: 🟢 Hot reload is working perfectly!
