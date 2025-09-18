#!/bin/bash
# Production deployment script for Sanzo Color Advisor
# Handles blue-green deployment with health checks and rollback capability

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
readonly LOG_FILE="/var/log/sanzo-deploy.log"
readonly BACKUP_DIR="/opt/sanzo/backups"
readonly SERVICE_NAME="sanzo-color-advisor"
readonly HEALTH_ENDPOINT="/api/health"
readonly MAX_HEALTH_RETRIES=30
readonly HEALTH_RETRY_INTERVAL=5

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

info() { log "INFO" "${BLUE}$*${NC}"; }
warn() { log "WARN" "${YELLOW}$*${NC}"; }
error() { log "ERROR" "${RED}$*${NC}"; }
success() { log "SUCCESS" "${GREEN}$*${NC}"; }

# Error handling
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        error "Deployment failed with exit code $exit_code"
        if [[ "${ROLLBACK_ON_FAILURE:-true}" == "true" ]]; then
            warn "Initiating automatic rollback..."
            rollback_deployment
        fi
    fi
    exit $exit_code
}

trap cleanup EXIT

# Help function
show_help() {
    cat << EOF
Sanzo Color Advisor Deployment Script

Usage: $0 [OPTIONS] COMMAND

Commands:
    deploy          Deploy new version
    rollback        Rollback to previous version
    health          Check service health
    status          Show deployment status
    backup          Create backup
    restore         Restore from backup

Options:
    -e, --env ENV               Environment (development|staging|production)
    -i, --image IMAGE           Docker image to deploy
    -p, --port PORT             Port to deploy on (default: 3000)
    -t, --timeout SECONDS       Health check timeout (default: 300)
    -b, --backup                Create backup before deployment
    -r, --rollback-on-failure   Rollback on deployment failure (default: true)
    -v, --verbose               Verbose output
    -h, --help                  Show this help message

Examples:
    $0 -e production -i sanzo:v1.2.0 deploy
    $0 -e staging rollback
    $0 health
EOF
}

# Parse command line arguments
parse_args() {
    ENVIRONMENT="production"
    IMAGE=""
    PORT="3000"
    TIMEOUT="300"
    CREATE_BACKUP="false"
    ROLLBACK_ON_FAILURE="true"
    VERBOSE="false"
    COMMAND=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -i|--image)
                IMAGE="$2"
                shift 2
                ;;
            -p|--port)
                PORT="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -b|--backup)
                CREATE_BACKUP="true"
                shift
                ;;
            -r|--rollback-on-failure)
                ROLLBACK_ON_FAILURE="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE="true"
                set -x
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            deploy|rollback|health|status|backup|restore)
                COMMAND="$1"
                shift
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    if [[ -z "$COMMAND" ]]; then
        error "Command is required"
        show_help
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    info "Checking prerequisites..."

    local required_commands=("docker" "docker-compose" "curl" "jq")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Required command '$cmd' is not installed"
            exit 1
        fi
    done

    # Check if running as appropriate user
    if [[ "$ENVIRONMENT" == "production" && "$EUID" -ne 0 ]]; then
        error "Production deployment must be run as root"
        exit 1
    fi

    # Create necessary directories
    mkdir -p "$BACKUP_DIR" /var/log
    success "Prerequisites check passed"
}

# Health check function
check_health() {
    local url="${1:-http://localhost:${PORT}${HEALTH_ENDPOINT}}"
    local retries="${2:-$MAX_HEALTH_RETRIES}"
    local interval="${3:-$HEALTH_RETRY_INTERVAL}"

    info "Checking health at $url (max $retries retries, ${interval}s interval)"

    for ((i=1; i<=retries; i++)); do
        if curl -f -s "$url" > /dev/null; then
            success "Health check passed on attempt $i"
            return 0
        fi

        if [[ $i -lt $retries ]]; then
            warn "Health check attempt $i failed, retrying in ${interval}s..."
            sleep "$interval"
        fi
    done

    error "Health check failed after $retries attempts"
    return 1
}

# Create backup
create_backup() {
    info "Creating backup..."

    local backup_timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_file="$BACKUP_DIR/sanzo_backup_${backup_timestamp}.tar.gz"

    # Stop service gracefully
    if docker-compose -f "$PROJECT_DIR/docker-compose.yml" ps -q "$SERVICE_NAME" > /dev/null; then
        info "Stopping service for backup..."
        docker-compose -f "$PROJECT_DIR/docker-compose.yml" stop "$SERVICE_NAME"
    fi

    # Create backup
    tar -czf "$backup_file" -C "$PROJECT_DIR" \
        docker-compose.yml \
        .env \
        data/ \
        logs/ || true

    # Record backup metadata
    cat > "$BACKUP_DIR/backup_${backup_timestamp}.meta" << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "environment": "$ENVIRONMENT",
    "image": "$(docker-compose -f "$PROJECT_DIR/docker-compose.yml" images -q "$SERVICE_NAME" 2>/dev/null || echo "unknown")",
    "file": "$backup_file",
    "size": "$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "unknown")"
}
EOF

    success "Backup created: $backup_file"
    echo "$backup_file"
}

# Deploy function
deploy() {
    info "Starting deployment to $ENVIRONMENT environment"

    if [[ -z "$IMAGE" ]]; then
        error "Image is required for deployment. Use -i or --image option."
        exit 1
    fi

    # Create backup if requested
    if [[ "$CREATE_BACKUP" == "true" ]]; then
        create_backup
    fi

    # Update environment file
    if [[ -f "$PROJECT_DIR/.env" ]]; then
        info "Updating environment configuration..."
        sed -i.bak "s/^NODE_ENV=.*/NODE_ENV=$ENVIRONMENT/" "$PROJECT_DIR/.env"
        sed -i.bak "s/^PORT=.*/PORT=$PORT/" "$PROJECT_DIR/.env"
    fi

    # Pull new image
    info "Pulling Docker image: $IMAGE"
    docker pull "$IMAGE"

    # Update docker-compose to use new image
    export SANZO_IMAGE="$IMAGE"
    export NODE_ENV="$ENVIRONMENT"
    export PORT="$PORT"

    # Blue-green deployment
    info "Performing blue-green deployment..."

    # Start new instance on alternate port
    local blue_port=$((PORT + 1000))
    info "Starting blue instance on port $blue_port"

    PORT="$blue_port" docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d "$SERVICE_NAME"

    # Health check new instance
    if check_health "http://localhost:${blue_port}${HEALTH_ENDPOINT}"; then
        info "Blue instance is healthy, switching traffic..."

        # Update main service to new version
        docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d "$SERVICE_NAME"

        # Final health check
        if check_health "http://localhost:${PORT}${HEALTH_ENDPOINT}"; then
            success "Deployment completed successfully"

            # Stop blue instance
            PORT="$blue_port" docker-compose -f "$PROJECT_DIR/docker-compose.yml" stop "$SERVICE_NAME"

            # Clean up old images (keep last 3)
            info "Cleaning up old images..."
            docker images | grep "$SERVICE_NAME" | tail -n +4 | awk '{print $3}' | xargs -r docker rmi || true

        else
            error "Final health check failed"
            exit 1
        fi
    else
        error "Blue instance health check failed"
        # Stop failed blue instance
        PORT="$blue_port" docker-compose -f "$PROJECT_DIR/docker-compose.yml" stop "$SERVICE_NAME"
        exit 1
    fi
}

# Rollback function
rollback_deployment() {
    info "Starting rollback process..."

    # Find previous backup
    local latest_backup=$(find "$BACKUP_DIR" -name "sanzo_backup_*.tar.gz" -type f | sort | tail -n 1)

    if [[ -z "$latest_backup" ]]; then
        error "No backup found for rollback"
        exit 1
    fi

    info "Rolling back to backup: $latest_backup"

    # Stop current service
    docker-compose -f "$PROJECT_DIR/docker-compose.yml" stop "$SERVICE_NAME" || true

    # Restore backup
    tar -xzf "$latest_backup" -C "$PROJECT_DIR"

    # Start service
    docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d "$SERVICE_NAME"

    # Health check
    if check_health; then
        success "Rollback completed successfully"
    else
        error "Rollback failed - service is not healthy"
        exit 1
    fi
}

# Status function
show_status() {
    info "Service Status:"

    if docker-compose -f "$PROJECT_DIR/docker-compose.yml" ps "$SERVICE_NAME" | grep -q "Up"; then
        success "Service is running"

        # Show container info
        docker-compose -f "$PROJECT_DIR/docker-compose.yml" ps "$SERVICE_NAME"

        # Show health status
        if check_health "http://localhost:${PORT}${HEALTH_ENDPOINT}" 1 1; then
            success "Service is healthy"
        else
            warn "Service is running but health check failed"
        fi

        # Show logs (last 20 lines)
        info "Recent logs:"
        docker-compose -f "$PROJECT_DIR/docker-compose.yml" logs --tail=20 "$SERVICE_NAME"
    else
        warn "Service is not running"
    fi
}

# Main function
main() {
    parse_args "$@"
    check_prerequisites

    case "$COMMAND" in
        deploy)
            deploy
            ;;
        rollback)
            rollback_deployment
            ;;
        health)
            check_health
            ;;
        status)
            show_status
            ;;
        backup)
            create_backup
            ;;
        restore)
            rollback_deployment
            ;;
        *)
            error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi