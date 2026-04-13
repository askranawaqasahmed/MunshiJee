# Makefile Guide - MunshiJee

## Quick Start

### Windows Users
```cmd
make.bat build
make.bat start
```

### Linux/Mac Users
```bash
make build
make start
```

## 📋 Available Commands

### Development Commands

```bash
# Install dependencies
make install

# Start development server (with hot reload)
make dev

# Run linter
make lint

# First time setup
make setup
```

### Build Commands

```bash
# Build for production
make build

# Start production server
make start

# Full deployment (install + build)
make deploy

# Complete production setup (install + generate + build)
make production
```

### Database Commands

```bash
# Setup database (run dbeaver-setup.sql)
make db-setup

# Generate Prisma client
make db-generate

# Run migrations
make db-migrate

# Seed database
make db-seed

# Open Prisma Studio (database GUI)
make db-studio
```

### Production Commands (PM2)

```bash
# Start with PM2 (process manager)
make pm2-start

# Stop PM2 processes
make pm2-stop

# Restart PM2 processes
make pm2-restart

# View PM2 logs
make logs
```

### Maintenance Commands

```bash
# Clean build files
make clean

# Start background worker
make worker

# Show help
make help
```

## 🚀 Common Workflows

### First Time Setup

```bash
# 1. Clone and install
git clone <repo>
cd MunshiJee
make install

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Setup database
make db-setup
# Or manually run dbeaver-setup.sql in DBeaver

# 4. Start development
make dev
```

### Development Workflow

```bash
# Start development server
make dev

# In another terminal - run worker (optional)
make worker

# Open database GUI (optional)
make db-studio
```

### Deployment Workflow

```bash
# Quick deployment
make deploy
make start

# Or with PM2 (recommended for production)
make production
make pm2-start
```

### Update and Redeploy

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
make build
make pm2-restart
```

## 🎯 Command Details

### `make install`
- Runs `npm install`
- Installs all dependencies from package.json

### `make build`
- Generates Prisma client
- Builds Next.js application
- Creates optimized production bundle in `.next/`

### `make deploy`
- Runs `install` + `build`
- Complete deployment preparation
- After this, run `make start` or `make pm2-start`

### `make production`
- Runs `install` + `db-generate` + `build`
- Most comprehensive production setup
- Ensures everything is ready for deployment

### `make db-setup`
- Requires `DATABASE_URL` environment variable
- Runs `dbeaver-setup.sql` using psql
- Creates complete database schema + seed data
- Creates super admin + subscription plans

### `make pm2-start`
- Builds the application
- Starts app with PM2 process manager
- Starts worker process
- Saves PM2 configuration
- Auto-restarts on crashes

## 🔧 Environment Requirements

### For `make db-setup`
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/munshijee"

# Then run
make db-setup
```

### For Windows
```cmd
set DATABASE_URL=postgresql://user:pass@host:5432/munshijee
make.bat db-setup
```

## 📦 What Each Build Creates

### `make build` creates:
```
.next/
├── cache/              # Build cache
├── server/             # Server-side code
├── static/             # Static assets
└── standalone/         # Standalone output (optional)
```

### `make pm2-start` creates:
```
PM2 Processes:
- munshijee           # Main application
- munshijee-worker    # Background worker

View with: pm2 list
```

## 🐛 Troubleshooting

### "make: command not found" (Windows)
Use `make.bat` instead:
```cmd
make.bat build
make.bat start
```

### "DATABASE_URL not set"
```bash
# Linux/Mac
export DATABASE_URL="postgresql://user:pass@host:5432/munshijee"

# Windows
set DATABASE_URL=postgresql://user:pass@host:5432/munshijee
```

### "psql: command not found"
Install PostgreSQL client or use DBeaver to run `dbeaver-setup.sql` manually.

### Build fails
```bash
# Clean and rebuild
make clean
make build

# Or reset everything
rm -rf node_modules
make install
make build
```

### PM2 not found
```bash
# Install PM2 globally
npm install -g pm2

# Then use
make pm2-start
```

## 💡 Tips

### Speed up builds
```bash
# Clean only when needed
make clean

# Use deploy for fresh installs
make deploy
```

### Development with auto-restart
```bash
# Terminal 1: Development server
make dev

# Terminal 2: Background worker
make worker

# Terminal 3: Database GUI
make db-studio
```

### Production with PM2
```bash
# Start everything
make pm2-start

# Monitor
make logs

# Restart after code changes
git pull
make build
make pm2-restart
```

## 🔄 Complete Deployment Checklist

### First Deployment
```bash
☐ Clone repository
☐ Run: make install
☐ Configure .env file
☐ Run: make db-setup (or setup DB manually)
☐ Run: make build
☐ Run: make pm2-start (or make start)
☐ Test: http://your-domain:3000
☐ Login as super admin
☐ Configure email/SMS settings
```

### Subsequent Deployments
```bash
☐ git pull origin main
☐ make build
☐ make pm2-restart
☐ Test application
```

## 📊 Command Comparison

| Task | Manual | Makefile |
|------|--------|----------|
| Build | `npm install && npm run db:generate && npm run build` | `make build` |
| Deploy | `npm install && npm run db:generate && npm run build && npm start` | `make deploy` then `make start` |
| Database | `psql $DATABASE_URL -f dbeaver-setup.sql` | `make db-setup` |
| PM2 Start | `pm2 start npm --name munshijee -- start && pm2 save` | `make pm2-start` |

## 🎓 Learning Path

1. **Development:** `make setup` → `make dev`
2. **Database:** `make db-setup` → `make db-studio`
3. **Build:** `make build` → check output
4. **Deploy:** `make deploy` → `make start`
5. **Production:** `make production` → `make pm2-start`
6. **Monitor:** `make logs`

---

**Quick Build:** `make build` 🔨  
**Quick Deploy:** `make deploy && make start` 🚀  
**Production:** `make pm2-start` 💼
