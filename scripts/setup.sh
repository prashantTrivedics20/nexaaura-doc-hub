#!/bin/bash

# NEXA-DOC-HUB Setup Script
set -e

echo "🚀 Setting up NEXA-DOC-HUB..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Setup environment files
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs uploads backups

# Setup Git hooks (if in git repo)
if [ -d ".git" ]; then
    echo "🔧 Setting up Git hooks..."
    echo "#!/bin/sh\nnpm run lint" > .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
fi

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start development: npm run dev"
echo "3. Or start with Docker: npm run docker:up"