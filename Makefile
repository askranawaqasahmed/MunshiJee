# MunshiJee - Makefile
# Quick commands for building and development

.PHONY: help install build dev clean db-generate lint deploy-package

# Default target - show help
help:
	@echo "========================================"
	@echo "MunshiJee - Build Commands"
	@echo "========================================"
	@echo ""
	@echo "Essential:"
	@echo "  make build          - Build for production"
	@echo "  make deploy-package - Create IIS deployment package"
	@echo "  make install        - Install dependencies"
	@echo "  make dev            - Start development server"
	@echo ""
	@echo "Database:"
	@echo "  make db-generate    - Generate Prisma client"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          - Clean build files"
	@echo "  make lint           - Run linter"
	@echo ""

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "✓ Dependencies installed"
	@echo ""

# Generate Prisma client
db-generate:
	@echo "Generating Prisma client..."
	npm run db:generate
	@echo "✓ Prisma client generated"
	@echo ""

# Build for production
build: install db-generate
	@echo "========================================"
	@echo "Building for production..."
	@echo "========================================"
	npm run build
	@echo ""
	@echo "========================================"
	@echo "✓ Build completed successfully!"
	@echo "========================================"
	@echo ""
	@echo "Build output location: .next/"
	@echo ""
	@echo "Files ready to copy:"
	@echo "  - .next/              (build output)"
	@echo "  - public/             (static files)"
	@echo "  - package.json        (dependencies)"
	@echo "  - package-lock.json   (lock file)"
	@echo "  - node_modules/       (if needed)"
	@echo ""

# Start development server
dev:
	@echo "Starting development server..."
	npm run dev

# Run linter
lint:
	@echo "Running linter..."
	npm run lint

# Clean build files
clean:
	@echo "Cleaning build files..."
	rm -rf .next
	rm -rf node_modules/.cache
	@echo "✓ Build files cleaned"
	@echo ""

# Rebuild from scratch
rebuild: clean build
	@echo "✓ Rebuild complete"

# Create deployment package for IIS
deploy-package: build
	@echo "========================================"
	@echo "Creating IIS Deployment Package..."
	@echo "========================================"
	@./create-deployment-package.sh || echo "Run: create-deployment-package.bat (Windows)"
