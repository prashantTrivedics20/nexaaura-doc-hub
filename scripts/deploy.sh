#!/bin/bash

# NEXA-DOC-HUB Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="nexa-doc-hub"
DOCKER_REGISTRY="your-registry.com"  # Update with your registry
VERSION=$(date +%Y%m%d-%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if environment file exists
    if [[ ! -f ".env" ]]; then
        error "Environment file (.env) not found. Copy .env.example and configure it."
    fi
    
    success "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if docker-compose ps | grep -q "Up"; then
        # Export current database
        docker-compose exec -T mongodb mongodump --archive --gzip | gzip > "backups/mongodb-backup-$(date +%Y%m%d-%H%M%S).gz"
        
        # Backup uploaded files
        if [[ -d "uploads" ]]; then
            tar -czf "backups/uploads-backup-$(date +%Y%m%d-%H%M%S).tar.gz" uploads/
        fi
        
        success "Backup completed"
    else
        warning "No running containers found, skipping backup"
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build backend image
    docker build -t "${PROJECT_NAME}-backend:${VERSION}" -t "${PROJECT_NAME}-backend:latest" --target backend .
    
    # Build frontend image
    docker build -t "${PROJECT_NAME}-frontend:${VERSION}" -t "${PROJECT_NAME}-frontend:latest" --target frontend .
    
    success "Docker images built successfully"
}

# Run security scan
security_scan() {
    log "Running security scan..."
    
    # Scan Docker images for vulnerabilities (requires Docker Scout or similar)
    if command -v docker &> /dev/null; then
        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            -v "$(pwd)":/app \
            aquasec/trivy image "${PROJECT_NAME}-backend:latest" || warning "Security scan failed"
    fi
    
    # Run npm audit
    cd backend && npm audit --audit-level moderate || warning "Backend npm audit found issues"
    cd ../frontend && npm audit --audit-level moderate || warning "Frontend npm audit found issues"
    cd ..
    
    success "Security scan completed"
}

# Deploy application
deploy() {
    log "Deploying application..."
    
    # Stop current containers
    docker-compose down --remove-orphans
    
    # Pull latest images (if using registry)
    # docker-compose pull
    
    # Start services
    docker-compose up -d --build
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check health
    if curl -f http://localhost:5000/health &> /dev/null; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    if curl -f http://localhost:80 &> /dev/null; then
        success "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    success "Deployment completed successfully"
}

# Run database migrations (if any)
run_migrations() {
    log "Running database migrations..."
    
    # Add your migration commands here
    # docker-compose exec backend npm run migrate
    
    success "Migrations completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Start monitoring services
    docker-compose --profile monitoring up -d
    
    success "Monitoring setup completed"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker resources..."
    
    # Remove old images (keep last 3 versions)
    docker images "${PROJECT_NAME}-backend" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +4 | awk '{print $1}' | xargs -r docker rmi || true
    
    docker images "${PROJECT_NAME}-frontend" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +4 | awk '{print $1}' | xargs -r docker rmi || true
    
    # Remove unused containers, networks, and volumes
    docker system prune -f
    
    success "Cleanup completed"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup
    if [[ -f "backups/mongodb-backup-latest.gz" ]]; then
        gunzip -c "backups/mongodb-backup-latest.gz" | docker-compose exec -T mongodb mongorestore --archive --drop
    fi
    
    if [[ -f "backups/uploads-backup-latest.tar.gz" ]]; then
        tar -xzf "backups/uploads-backup-latest.tar.gz"
    fi
    
    # Start with previous images
    docker-compose up -d
    
    success "Rollback completed"
}

# Main deployment flow
main() {
    log "Starting deployment for environment: ${ENVIRONMENT}"
    
    # Create backups directory
    mkdir -p backups
    
    case "${ENVIRONMENT}" in
        "production")
            check_prerequisites
            backup_current
            build_images
            security_scan
            deploy
            run_migrations
            setup_monitoring
            cleanup
            ;;
        "staging")
            check_prerequisites
            build_images
            deploy
            run_migrations
            ;;
        "rollback")
            rollback
            ;;
        *)
            error "Unknown environment: ${ENVIRONMENT}. Use 'production', 'staging', or 'rollback'"
            ;;
    esac
    
    success "Deployment process completed for ${ENVIRONMENT}"
    
    # Display useful information
    log "Application URLs:"
    log "  Frontend: http://localhost:80"
    log "  Backend API: http://localhost:5000"
    log "  Health Check: http://localhost:5000/health"
    log "  Metrics: http://localhost:5000/metrics"
    
    if docker-compose --profile monitoring ps | grep -q grafana; then
        log "  Grafana: http://localhost:3001"
    fi
}

# Handle script arguments
case "${1}" in
    "rollback")
        rollback
        ;;
    *)
        main
        ;;
esac