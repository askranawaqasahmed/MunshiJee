# Setup Guide

Complete setup instructions for MunshiJee invoicing application.

## Prerequisites

1. **Node.js 18+**
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL Database**
   - Download from: https://www.postgresql.org/download/
   - Or use cloud provider (Railway, Supabase, etc.)
   - Create a database named `munshijee`

3. **Redis (Optional)**
   - Only needed for automated recurring invoice generation
   - Windows: https://github.com/microsoftarchive/redis/releases
   - Or use Docker: `docker run -d -p 6379:6379 redis`

## Installation Steps

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd MunshiJee
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Required - Your PostgreSQL connection
DATABASE_URL="postgresql://username:password@localhost:5432/munshijee"

# Required - Generate a random secret
NEXTAUTH_SECRET="your-random-secret-key-here"

# Required - Your app URL
NEXTAUTH_URL="http://localhost:3000"

# Required - Admin credentials for first login
ADMIN_EMAIL="admin@munshijee.com"
ADMIN_PASSWORD="admin123"

# Optional - Only if using background jobs
# REDIS_URL="redis://localhost:6379"
```

**How to generate a secure NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set Up Database

Generate Prisma client:
```bash
npm run db:generate
```

Run migrations to create tables:
```bash
npm run db:migrate
```

Seed the database with admin user:
```bash
npm run db:seed
```

### 4. Start the Application

**Option A: Using npm (Recommended for first time)**
```bash
npm run dev
```

**Option B: Using Makefile**
```bash
cd src
make dev
```

The application will be available at: http://localhost:3000

### 5. First Login

Navigate to http://localhost:3000 and login with:
- **Email:** The email from your `.env` file (default: `admin@munshijee.com`)
- **Password:** The password from your `.env` file (default: `admin123`)

**Important:** Change the admin password after first login!

## Using the Makefile

The Makefile provides convenient commands for development. All commands should be run from the `src/` directory:

```bash
cd src
```

### Available Commands

```bash
# Show all available commands
make help

# Install dependencies
make install

# Start development server (without background worker)
make dev

# Start with background worker (requires Redis)
make dev-with-worker

# Stop all running processes
make stop

# Force kill all Node processes
make kill

# Database commands
make db-generate    # Generate Prisma client
make db-migrate     # Run migrations
make db-seed        # Seed admin user
make db-studio      # Open Prisma Studio GUI

# Build for production
make build
```

## Troubleshooting

### Port 3000 Already in Use

Kill existing processes:
```bash
cd src
make kill
```

Or manually:
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

### Database Connection Error

1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Ensure database `munshijee` exists:
   ```sql
   CREATE DATABASE munshijee;
   ```

### Prisma Client Not Generated

Run:
```bash
npm run db:generate
```

### Migration Errors

Reset database (WARNING: deletes all data):
```bash
cd src
npx prisma migrate reset --schema=./prisma/schema.prisma
```

### Redis Connection Error (if using worker)

If you see Redis connection errors but don't need background jobs:
1. Comment out `REDIS_URL` in `.env`
2. Restart the application
3. Background jobs will be disabled (recurring invoices must be created manually)

## Production Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
REDIS_URL="your-production-redis-url"  # Optional
NEXTAUTH_SECRET="generate-a-new-secret-for-production"
NEXTAUTH_URL="https://yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-password"
NODE_ENV="production"
```

### Build and Start

```bash
# Build
npm run build

# Start
npm run start
```

### Deploying to Railway

1. Create a new project on Railway
2. Add PostgreSQL database service
3. Add Redis service (optional)
4. Connect your GitHub repository
5. Set environment variables in Railway dashboard
6. Railway will auto-deploy

### Deploying to Vercel

1. Connect repository to Vercel
2. Add PostgreSQL database (Vercel Postgres or external)
3. Set environment variables in Vercel dashboard
4. Note: Background workers may need separate deployment (Railway, Heroku, etc.)

## Optional Features

### Enabling Background Jobs

Background jobs enable automatic recurring invoice generation.

**Requirements:**
- Redis server running
- `REDIS_URL` configured in `.env`

**Setup:**
1. Install and start Redis
2. Uncomment `REDIS_URL` in `.env`
3. Start application with worker:
   ```bash
   cd src
   make dev-with-worker
   ```

### Using Prisma Studio

Prisma Studio provides a GUI for your database:

```bash
cd src
make db-studio
```

Access at: http://localhost:5555

## Development Workflow

### Making Schema Changes

1. Edit `src/prisma/schema.prisma`
2. Create migration:
   ```bash
   npm run db:migrate
   ```
3. Prisma will prompt for migration name
4. New migration files created in `src/prisma/migrations/`

### Adding Seed Data

Edit `src/prisma/seed.ts` and run:
```bash
cd src
make db-seed
```

## Next Steps

After setup is complete:

1. **Add Customers** - Navigate to Customers > Add Customer
2. **Create Invoices** - Navigate to Invoices > Create Invoice
3. **Test Customer Login** - Login with a customer account
4. **Explore Features** - Try bulk upload, PDF generation, etc.

For more information:
- [Database Schema](./DATABASE.md)
- [API Reference](./API.md)
- [Invoice Types](./INVOICING.md)
