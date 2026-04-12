.PHONY: dev dev-with-worker stop kill build db-migrate db-seed db-studio db-generate install help

help:
	@echo "Available commands:"
	@echo "  make install         - Install all dependencies"
	@echo "  make dev            - Start Next.js dev server only (no background worker)"
	@echo "  make dev-with-worker - Start dev server + background worker (requires Redis)"
	@echo "  make stop           - Stop all running Node.js and npm processes"
	@echo "  make kill           - Force kill ALL Node-related processes"
	@echo "  make build          - Build for production"
	@echo "  make db-generate    - Generate Prisma client"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-seed        - Seed the database with admin user"
	@echo "  make db-studio      - Open Prisma Studio"
	@echo ""
	@echo "Quick workflow:"
	@echo "  1. make db-generate && make db-migrate && make db-seed  (first time)"
	@echo "  2. make dev                                              (start app)"
	@echo "  3. make stop                                             (stop app)"

install:
	@echo "Installing dependencies..."
	@cd .. && npm install
	@echo "Installation complete!"

dev:
	@echo "Starting Next.js development server..."
	@powershell -ExecutionPolicy Bypass -File ./stop-servers.ps1
	@echo "Note: Background worker NOT started (Redis not required)"
	@cd .. && npm run dev

dev-with-worker:
	@echo "Starting development environment with background worker..."
	@echo "Make sure Redis is running first!"
	@cd .. && start /B npm run dev
	@timeout /t 3 /nobreak > nul
	@cd .. && start /B npm run worker
	@echo "Development servers started!"

stop:
	@powershell -ExecutionPolicy Bypass -File ./stop-servers.ps1

kill:
	@echo "Force killing ALL Node-related processes..."
	@powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
	@powershell -Command "Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
	@powershell -Command "Get-Process tsx -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
	@echo "All processes killed!"

build:
	@echo "Building for production..."
	@cd .. && npm run build

db-generate:
	@echo "Generating Prisma client..."
	@cd .. && npm run db:generate

db-migrate:
	@echo "Running database migrations..."
	@cd .. && npm run db:migrate

db-seed:
	@echo "Seeding database..."
	@cd .. && npm run db:seed

db-studio:
	@echo "Opening Prisma Studio..."
	@cd .. && npm run db:studio
