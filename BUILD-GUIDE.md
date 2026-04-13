# Build Guide - MunshiJee

## Quick Build

### Windows
```cmd
make.bat build
```

### Linux/Mac
```bash
make build
```

That's it! The command will:
1. Install dependencies (`npm install`)
2. Generate Prisma client (`npm run db:generate`)
3. Build the Next.js app (`npm run build`)

## What Gets Built

After running `make build`, you'll have:

```
MunshiJee/
├── .next/                  ← Main build output (copy this)
│   ├── cache/
│   ├── server/
│   ├── static/
│   └── standalone/
├── public/                 ← Static files (copy this)
├── package.json            ← Dependencies list (copy this)
├── package-lock.json       ← Lock file (copy this)
└── node_modules/           ← Optional (can reinstall on server)
```

## Files to Copy for Deployment

### Essential Files (Must Copy)
```
.next/              - Build output
public/             - Static assets
package.json        - Dependencies
package-lock.json   - Exact versions
```

### Configuration Files (Must Configure)
```
.env                - Environment variables (create on server)
```

### Optional
```
node_modules/       - Dependencies (or run npm install on server)
```

## Deployment Steps

### 1. Build Locally
```bash
make build
```

### 2. Copy Files to Server
```bash
# Essential files
.next/
public/
package.json
package-lock.json

# Optional
node_modules/
```

### 3. On Server
```bash
# If you copied node_modules
npm start

# If you didn't copy node_modules
npm install
npm start
```

### 4. Configure Environment
Create `.env` file on server:
```env
DATABASE_URL="postgresql://user:pass@host:5432/munshijee"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"
```

## Available Commands

```bash
make build          # Build for production
make install        # Install dependencies only
make dev            # Start development server
make db-generate    # Generate Prisma client only
make clean          # Clean build files
make rebuild        # Clean and rebuild
make lint           # Run linter
make help           # Show all commands
```

## Build Output Details

### `.next/` Directory Structure
```
.next/
├── BUILD_ID                    # Build identifier
├── cache/                      # Build cache
├── server/                     # Server-side code
│   ├── app/                    # App router pages
│   ├── chunks/                 # Code chunks
│   └── pages/                  # API routes
├── static/                     # Static files
│   ├── chunks/                 # Client bundles
│   ├── css/                    # Stylesheets
│   └── media/                  # Images, fonts
└── routes-manifest.json        # Routing info
```

## Server Requirements

### On Production Server You Need:
- Node.js 18+ installed
- PostgreSQL database (already setup using dbeaver-setup.sql)
- Port 3000 available (or set PORT env var)

### Starting the Application
```bash
# Default (port 3000)
npm start

# Custom port
PORT=8080 npm start
```

## Troubleshooting

### Build Fails
```bash
# Clean and try again
make clean
make build
```

### "Prisma Client not found"
```bash
# Generate Prisma client
make db-generate

# Then rebuild
make build
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
make install
make build
```

### Build is slow
First build is always slower. Subsequent builds are faster due to caching.

## Production Checklist

Before copying to server:
- [ ] Run `make build` successfully
- [ ] Check `.next/` folder exists
- [ ] Verify build output (check for errors)
- [ ] Test build locally with `npm start`

On server:
- [ ] Copy all essential files
- [ ] Create `.env` file
- [ ] Run `npm install` (if needed)
- [ ] Run `npm start`
- [ ] Access application (http://server:3000)
- [ ] Test login
- [ ] Verify database connection

## Build Size

Typical build output:
- `.next/`: ~50-100 MB
- `node_modules/`: ~200-500 MB (if copying)
- `public/`: ~1-5 MB

Total: ~250-600 MB (depending on if you copy node_modules)

## Tips

### Faster Deployments
1. Build locally: `make build`
2. Copy only `.next/` and `public/`
3. On server: `npm install && npm start`

### Rebuild After Changes
```bash
make rebuild
```

### Check Build Output
After `make build`, check for:
- ✓ No error messages
- ✓ `.next/BUILD_ID` file exists
- ✓ `.next/server/` contains files
- ✓ `.next/static/` contains files

---

**Quick Command:** `make build` 🔨  
**Output Location:** `.next/` 📦  
**Start Server:** `npm start` 🚀
