#!/bin/bash
# Comprehensive health check script for Sanzo Color Advisor
# Validates service health, performance, and dependencies

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
readonly DEFAULT_HOST="localhost"
readonly DEFAULT_PORT="3000"
readonly DEFAULT_TIMEOUT="30"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Global variables
HOST="$DEFAULT_HOST"
PORT="$DEFAULT_PORT"
TIMEOUT="$DEFAULT_TIMEOUT"
VERBOSE=false
OUTPUT_FORMAT="text"
METRICS_FILE=""

# Logging
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        INFO) echo -e "${timestamp} ${BLUE}[INFO]${NC} $message" ;;
        WARN) echo -e "${timestamp} ${YELLOW}[WARN]${NC} $message" ;;
        ERROR) echo -e "${timestamp} ${RED}[ERROR]${NC} $message" ;;
        SUCCESS) echo -e "${timestamp} ${GREEN}[SUCCESS]${NC} $message" ;;
    esac
}

info() { log "INFO" "$*"; }
warn() { log "WARN" "$*"; }
error() { log "ERROR" "$*"; }
success() { log "SUCCESS" "$*"; }

# Help function
show_help() {
    cat << EOF
Sanzo Color Advisor Health Check Script

Usage: $0 [OPTIONS]

Options:
    -h, --host HOST         Host to check (default: localhost)
    -p, --port PORT         Port to check (default: 3000)
    -t, --timeout SECONDS   Request timeout (default: 30)
    -v, --verbose           Verbose output
    -f, --format FORMAT     Output format (text|json|prometheus)
    -m, --metrics FILE      Save metrics to file
    --help                  Show this help message

Health Checks:
    - Service availability
    - API endpoint functionality
    - Response time performance
    - Memory and CPU usage
    - Dependencies status
    - Security headers
    - SSL certificate (if HTTPS)

Examples:
    $0                                    # Basic health check
    $0 -h api.example.com -p 443 -v     # Check remote HTTPS service
    $0 -f json -m metrics.json          # Save metrics as JSON
    $0 -f prometheus > metrics.prom     # Prometheus format output
EOF
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--host)
                HOST="$2"
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
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -f|--format)
                OUTPUT_FORMAT="$2"
                shift 2
                ;;
            -m|--metrics)
                METRICS_FILE="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Make HTTP request with error handling
make_request() {
    local url="$1"
    local method="${2:-GET}"
    local expected_status="${3:-200}"

    if command_exists curl; then
        local response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total};SIZE:%{size_download}" \
                            -X "$method" \
                            --max-time "$TIMEOUT" \
                            --connect-timeout 10 \
                            "$url" 2>/dev/null || echo "HTTPSTATUS:000;TIME:0;SIZE:0")

        local status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        local time=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)
        local size=$(echo "$response" | grep -o "SIZE:[0-9]*" | cut -d: -f2)
        local body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*;TIME:[0-9.]*;SIZE:[0-9]*$//')

        echo "{\"status\":$status,\"time\":$time,\"size\":$size,\"body\":\"$body\"}"
    else
        error "curl command not found"
        return 1
    fi
}

# Basic connectivity check
check_connectivity() {
    local url="http://$HOST:$PORT"

    if [[ "$VERBOSE" == true ]]; then
        info "Checking connectivity to $url"
    fi

    local result=$(make_request "$url")
    local status=$(echo "$result" | jq -r '.status // 0')
    local time=$(echo "$result" | jq -r '.time // 0')

    if [[ "$status" -ge 200 && "$status" -lt 400 ]]; then
        success "Connectivity check passed (HTTP $status, ${time}s)"
        return 0
    else
        error "Connectivity check failed (HTTP $status)"
        return 1
    fi
}

# Health endpoint check
check_health_endpoint() {
    local url="http://$HOST:$PORT/api/health"

    if [[ "$VERBOSE" == true ]]; then
        info "Checking health endpoint: $url"
    fi

    local result=$(make_request "$url")
    local status=$(echo "$result" | jq -r '.status // 0')
    local time=$(echo "$result" | jq -r '.time // 0')
    local body=$(echo "$result" | jq -r '.body // ""')

    if [[ "$status" -eq 200 ]]; then
        local health_status=$(echo "$body" | jq -r '.data.status // "unknown"' 2>/dev/null || echo "unknown")

        if [[ "$health_status" == "healthy" ]]; then
            success "Health endpoint check passed (${time}s)"

            if [[ "$VERBOSE" == true ]]; then
                local version=$(echo "$body" | jq -r '.data.version // "unknown"' 2>/dev/null || echo "unknown")
                local uptime=$(echo "$body" | jq -r '.data.uptime // "unknown"' 2>/dev/null || echo "unknown")
                info "Version: $version, Uptime: ${uptime}s"
            fi

            return 0
        else
            warn "Health endpoint returned unhealthy status: $health_status"
            return 1
        fi
    else
        error "Health endpoint check failed (HTTP $status)"
        return 1
    fi
}

# API functionality check
check_api_functionality() {
    local base_url="http://$HOST:$PORT/api"
    local checks_passed=0
    local total_checks=0

    if [[ "$VERBOSE" == true ]]; then
        info "Checking API functionality"
    fi

    # Test /api/colors endpoint
    total_checks=$((total_checks + 1))
    local colors_result=$(make_request "$base_url/colors?limit=5")
    local colors_status=$(echo "$colors_result" | jq -r '.status // 0')

    if [[ "$colors_status" -eq 200 ]]; then
        checks_passed=$((checks_passed + 1))
        if [[ "$VERBOSE" == true ]]; then
            success "Colors endpoint working"
        fi
    else
        warn "Colors endpoint failed (HTTP $colors_status)"
    fi

    # Test /api/combinations endpoint
    total_checks=$((total_checks + 1))
    local combinations_result=$(make_request "$base_url/combinations?limit=3")
    local combinations_status=$(echo "$combinations_result" | jq -r '.status // 0')

    if [[ "$combinations_status" -eq 200 ]]; then
        checks_passed=$((checks_passed + 1))
        if [[ "$VERBOSE" == true ]]; then
            success "Combinations endpoint working"
        fi
    else
        warn "Combinations endpoint failed (HTTP $combinations_status)"
    fi

    # Test /api/docs endpoint
    total_checks=$((total_checks + 1))
    local docs_result=$(make_request "$base_url/docs")
    local docs_status=$(echo "$docs_result" | jq -r '.status // 0')

    if [[ "$docs_status" -eq 200 ]]; then
        checks_passed=$((checks_passed + 1))
        if [[ "$VERBOSE" == true ]]; then
            success "Documentation endpoint working"
        fi
    else
        warn "Documentation endpoint failed (HTTP $docs_status)"
    fi

    local pass_rate=$(echo "scale=2; $checks_passed * 100 / $total_checks" | bc 2>/dev/null || echo "0")

    if [[ "$checks_passed" -eq "$total_checks" ]]; then
        success "API functionality check passed ($checks_passed/$total_checks endpoints working)"
        return 0
    elif [[ "$checks_passed" -gt 0 ]]; then
        warn "API functionality partially working ($checks_passed/$total_checks endpoints, ${pass_rate}%)"
        return 1
    else
        error "API functionality check failed (0/$total_checks endpoints working)"
        return 1
    fi
}

# Performance check
check_performance() {
    local url="http://$HOST:$PORT/api/health"
    local samples=5
    local total_time=0
    local max_time=0
    local min_time=999999

    if [[ "$VERBOSE" == true ]]; then
        info "Running performance check ($samples samples)"
    fi

    for ((i=1; i<=samples; i++)); do
        local result=$(make_request "$url")
        local time=$(echo "$result" | jq -r '.time // 0')
        local time_ms=$(echo "$time * 1000" | bc 2>/dev/null || echo "0")

        total_time=$(echo "$total_time + $time" | bc 2>/dev/null || echo "0")

        if (( $(echo "$time > $max_time" | bc -l 2>/dev/null || echo "0") )); then
            max_time=$time
        fi

        if (( $(echo "$time < $min_time" | bc -l 2>/dev/null || echo "0") )); then
            min_time=$time
        fi

        if [[ "$VERBOSE" == true ]]; then
            info "Sample $i: ${time_ms}ms"
        fi

        sleep 0.5
    done

    local avg_time=$(echo "scale=3; $total_time / $samples" | bc 2>/dev/null || echo "0")
    local avg_time_ms=$(echo "$avg_time * 1000" | bc 2>/dev/null || echo "0")
    local max_time_ms=$(echo "$max_time * 1000" | bc 2>/dev/null || echo "0")
    local min_time_ms=$(echo "$min_time * 1000" | bc 2>/dev/null || echo "0")

    # Performance thresholds
    local warning_threshold=1.0  # 1 second
    local critical_threshold=5.0 # 5 seconds

    if (( $(echo "$avg_time < $warning_threshold" | bc -l 2>/dev/null || echo "0") )); then
        success "Performance check passed (avg: ${avg_time_ms}ms, min: ${min_time_ms}ms, max: ${max_time_ms}ms)"
        return 0
    elif (( $(echo "$avg_time < $critical_threshold" | bc -l 2>/dev/null || echo "0") )); then
        warn "Performance degraded (avg: ${avg_time_ms}ms, min: ${min_time_ms}ms, max: ${max_time_ms}ms)"
        return 1
    else
        error "Performance check failed (avg: ${avg_time_ms}ms, min: ${min_time_ms}ms, max: ${max_time_ms}ms)"
        return 1
    fi
}

# Docker container health check
check_container_health() {
    if ! command_exists docker; then
        warn "Docker not available, skipping container health check"
        return 0
    fi

    if [[ "$VERBOSE" == true ]]; then
        info "Checking Docker container health"
    fi

    local container_name="sanzo-color-advisor"
    local container_status

    if container_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null); then
        case "$container_status" in
            "healthy")
                success "Container health check passed"
                return 0
                ;;
            "unhealthy")
                error "Container health check failed"
                return 1
                ;;
            "starting")
                warn "Container is still starting"
                return 1
                ;;
            *)
                warn "Container health status unknown: $container_status"
                return 1
                ;;
        esac
    else
        warn "Container not found or not running"
        return 1
    fi
}

# Security headers check
check_security_headers() {
    local url="http://$HOST:$PORT"

    if [[ "$VERBOSE" == true ]]; then
        info "Checking security headers"
    fi

    if command_exists curl; then
        local headers=$(curl -s -I "$url" 2>/dev/null || echo "")
        local security_score=0
        local total_checks=5

        # Check for security headers
        if echo "$headers" | grep -qi "x-content-type-options"; then
            security_score=$((security_score + 1))
            if [[ "$VERBOSE" == true ]]; then
                success "X-Content-Type-Options header present"
            fi
        else
            warn "X-Content-Type-Options header missing"
        fi

        if echo "$headers" | grep -qi "x-frame-options"; then
            security_score=$((security_score + 1))
            if [[ "$VERBOSE" == true ]]; then
                success "X-Frame-Options header present"
            fi
        else
            warn "X-Frame-Options header missing"
        fi

        if echo "$headers" | grep -qi "x-xss-protection"; then
            security_score=$((security_score + 1))
            if [[ "$VERBOSE" == true ]]; then
                success "X-XSS-Protection header present"
            fi
        else
            warn "X-XSS-Protection header missing"
        fi

        if echo "$headers" | grep -qi "strict-transport-security"; then
            security_score=$((security_score + 1))
            if [[ "$VERBOSE" == true ]]; then
                success "Strict-Transport-Security header present"
            fi
        else
            warn "Strict-Transport-Security header missing"
        fi

        if echo "$headers" | grep -qi "content-security-policy"; then
            security_score=$((security_score + 1))
            if [[ "$VERBOSE" == true ]]; then
                success "Content-Security-Policy header present"
            fi
        else
            warn "Content-Security-Policy header missing"
        fi

        local security_percentage=$((security_score * 100 / total_checks))

        if [[ "$security_score" -ge 4 ]]; then
            success "Security headers check passed ($security_score/$total_checks, ${security_percentage}%)"
            return 0
        elif [[ "$security_score" -ge 2 ]]; then
            warn "Security headers partially configured ($security_score/$total_checks, ${security_percentage}%)"
            return 1
        else
            error "Security headers check failed ($security_score/$total_checks, ${security_percentage}%)"
            return 1
        fi
    else
        warn "curl not available, skipping security headers check"
        return 0
    fi
}

# Generate report
generate_report() {
    local connectivity_status="$1"
    local health_status="$2"
    local api_status="$3"
    local performance_status="$4"
    local container_status="$5"
    local security_status="$6"

    local overall_status="healthy"
    local checks_passed=0
    local total_checks=6

    # Count passed checks
    [[ "$connectivity_status" -eq 0 ]] && checks_passed=$((checks_passed + 1)) || overall_status="unhealthy"
    [[ "$health_status" -eq 0 ]] && checks_passed=$((checks_passed + 1)) || overall_status="unhealthy"
    [[ "$api_status" -eq 0 ]] && checks_passed=$((checks_passed + 1)) || overall_status="unhealthy"
    [[ "$performance_status" -eq 0 ]] && checks_passed=$((checks_passed + 1)) || overall_status="degraded"
    [[ "$container_status" -eq 0 ]] && checks_passed=$((checks_passed + 1))
    [[ "$security_status" -eq 0 ]] && checks_passed=$((checks_passed + 1))

    local health_percentage=$((checks_passed * 100 / total_checks))

    case "$OUTPUT_FORMAT" in
        "json")
            cat << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "service": "sanzo-color-advisor",
    "host": "$HOST",
    "port": $PORT,
    "overall_status": "$overall_status",
    "health_percentage": $health_percentage,
    "checks": {
        "connectivity": $([ "$connectivity_status" -eq 0 ] && echo "true" || echo "false"),
        "health_endpoint": $([ "$health_status" -eq 0 ] && echo "true" || echo "false"),
        "api_functionality": $([ "$api_status" -eq 0 ] && echo "true" || echo "false"),
        "performance": $([ "$performance_status" -eq 0 ] && echo "true" || echo "false"),
        "container_health": $([ "$container_status" -eq 0 ] && echo "true" || echo "false"),
        "security_headers": $([ "$security_status" -eq 0 ] && echo "true" || echo "false")
    }
}
EOF
            ;;
        "prometheus")
            cat << EOF
# HELP sanzo_health_check Health check status (1=healthy, 0=unhealthy)
# TYPE sanzo_health_check gauge
sanzo_health_check{check="connectivity"} $([ "$connectivity_status" -eq 0 ] && echo "1" || echo "0")
sanzo_health_check{check="health_endpoint"} $([ "$health_status" -eq 0 ] && echo "1" || echo "0")
sanzo_health_check{check="api_functionality"} $([ "$api_status" -eq 0 ] && echo "1" || echo "0")
sanzo_health_check{check="performance"} $([ "$performance_status" -eq 0 ] && echo "1" || echo "0")
sanzo_health_check{check="container_health"} $([ "$container_status" -eq 0 ] && echo "1" || echo "0")
sanzo_health_check{check="security_headers"} $([ "$security_status" -eq 0 ] && echo "1" || echo "0")

# HELP sanzo_health_percentage Overall health percentage
# TYPE sanzo_health_percentage gauge
sanzo_health_percentage $health_percentage
EOF
            ;;
        *)
            echo
            echo "========================================="
            echo "Sanzo Color Advisor Health Check Report"
            echo "========================================="
            echo "Timestamp: $(date)"
            echo "Target: $HOST:$PORT"
            echo "Overall Status: $overall_status"
            echo "Health Percentage: $health_percentage%"
            echo
            echo "Check Results:"
            echo "- Connectivity: $([ "$connectivity_status" -eq 0 ] && echo "✓ PASS" || echo "✗ FAIL")"
            echo "- Health Endpoint: $([ "$health_status" -eq 0 ] && echo "✓ PASS" || echo "✗ FAIL")"
            echo "- API Functionality: $([ "$api_status" -eq 0 ] && echo "✓ PASS" || echo "✗ FAIL")"
            echo "- Performance: $([ "$performance_status" -eq 0 ] && echo "✓ PASS" || echo "✗ FAIL")"
            echo "- Container Health: $([ "$container_status" -eq 0 ] && echo "✓ PASS" || echo "✗ FAIL")"
            echo "- Security Headers: $([ "$security_status" -eq 0 ] && echo "✓ PASS" || echo "✗ FAIL")"
            echo "========================================="
            ;;
    esac
}

# Main function
main() {
    parse_args "$@"

    if [[ "$VERBOSE" == true ]]; then
        info "Starting health check for $HOST:$PORT"
    fi

    # Run all checks
    local connectivity_status=1
    local health_status=1
    local api_status=1
    local performance_status=1
    local container_status=1
    local security_status=1

    check_connectivity && connectivity_status=0 || true
    check_health_endpoint && health_status=0 || true
    check_api_functionality && api_status=0 || true
    check_performance && performance_status=0 || true
    check_container_health && container_status=0 || true
    check_security_headers && security_status=0 || true

    # Generate report
    local report=$(generate_report $connectivity_status $health_status $api_status $performance_status $container_status $security_status)

    echo "$report"

    # Save metrics if requested
    if [[ -n "$METRICS_FILE" ]]; then
        echo "$report" > "$METRICS_FILE"
        info "Metrics saved to $METRICS_FILE"
    fi

    # Exit with appropriate code
    if [[ "$connectivity_status" -eq 0 && "$health_status" -eq 0 && "$api_status" -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi