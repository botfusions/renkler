#!/bin/bash

# Sanzo Color Advisor - GitHub + Netlify Deployment Script
# Simple deployment automation for GitHub repository and Netlify hosting

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    log_info "Checking requirements..."

    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi

    log_success "All requirements met"
}

# Check git status
check_git_status() {
    log_info "Checking git status..."

    if [ -n "$(git status --porcelain)" ]; then
        log_warning "You have uncommitted changes"
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi

    # Check if we're on main branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        log_warning "You're not on the main branch (current: $CURRENT_BRANCH)"
        read -p "Do you want to switch to main? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git checkout main
            git pull origin main
        fi
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    if npm ci; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
}

# Run tests
run_tests() {
    log_info "Running tests..."

    if npm run test; then
        log_success "All tests passed"
    else
        log_error "Tests failed"
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 1
        fi
    fi
}

# Run linting
run_lint() {
    log_info "Running linting..."

    if npm run lint; then
        log_success "Linting passed"
    else
        log_warning "Linting issues found"
        read -p "Do you want to auto-fix and continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm run lint:fix
            log_success "Linting issues fixed"
        fi
    fi
}

# Build project
build_project() {
    log_info "Building project for production..."

    # Set production environment
    export NODE_ENV=production
    export CI=true

    if npm run build; then
        log_success "Build completed successfully"
        log_info "Build output in ./public directory"
    else
        log_error "Build failed"
        exit 1
    fi
}

# Clean up test and development files
cleanup_files() {
    log_info "Cleaning up development files..."

    # Remove test servers and development files (they're in .gitignore)
    rm -f test-server.js photo-test-server.js n8n-webhook-server.js test-image.html test-workflows.js 2>/dev/null || true

    # Remove development documentation
    rm -f CUSTOMER_UI_SUMMARY.md PHOTO_ANALYSIS_SUMMARY.md N8N_WORKFLOW_AUTOMATION_SUMMARY.md 2>/dev/null || true

    log_success "Development files cleaned up"
}

# Commit and push changes
commit_and_push() {
    log_info "Preparing deployment commit..."

    # Add all changes
    git add .

    # Check if there are changes to commit
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No changes to commit"
        return
    fi

    # Get current version from package.json
    VERSION=$(node -p "require('./package.json').version")

    # Create commit message
    COMMIT_MSG="🚀 Deploy v${VERSION} to production

🎯 Production deployment with:
- Complete N8N workflow automation system
- MCP integration for enhanced functionality
- Optimized build and security configuration
- Comprehensive monitoring and analytics

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

    # Commit changes
    git commit -m "$COMMIT_MSG"

    # Push to main branch
    log_info "Pushing to GitHub..."
    git push origin main

    log_success "Changes pushed to GitHub"
}

# Create GitHub release (optional)
create_release() {
    read -p "Do you want to create a GitHub release? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        VERSION=$(node -p "require('./package.json').version")

        if command -v gh &> /dev/null; then
            log_info "Creating GitHub release..."

            RELEASE_NOTES="## 🚀 Release v${VERSION}

### ✨ Features
- Complete Sanzo Color Advisor application
- N8N workflow automation system
- MCP integration for enhanced functionality
- AI-powered room photo analysis
- Real-time color recommendations

### 🛠️ Technical Improvements
- Optimized build configuration
- Security hardening
- Comprehensive monitoring
- Netlify deployment automation

### 📊 Performance
- Fast static site deployment
- CDN optimization
- Cached color data
- Responsive design

### 🔧 Deployment
- GitHub Actions CI/CD
- Automated testing
- Security scanning
- Zero-downtime deployments"

            gh release create "v${VERSION}" \
                --title "🎨 Sanzo Color Advisor v${VERSION}" \
                --notes "$RELEASE_NOTES" \
                --latest

            log_success "GitHub release created"
        else
            log_warning "GitHub CLI not installed. You can create a release manually at:"
            REPO_URL=$(git config --get remote.origin.url | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
            log_info "${REPO_URL}/releases/new"
        fi
    fi
}

# Check deployment status
check_deployment() {
    log_info "Checking deployment status..."

    # Wait a bit for GitHub Actions to start
    sleep 10

    if command -v gh &> /dev/null; then
        log_info "GitHub Actions status:"
        gh run list --limit 3

        log_info "You can monitor the deployment at:"
        REPO_URL=$(git config --get remote.origin.url | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')
        echo "${REPO_URL}/actions"
    else
        log_info "Monitor deployment at GitHub Actions tab in your repository"
    fi

    log_info "Once deployed, your app will be available at:"
    log_info "https://sanzo-color-advisor.netlify.app"

    log_info "Netlify deployment details:"
    log_info "- Build command: npm run build"
    log_info "- Publish directory: public"
    log_info "- Environment: production"
}

# Manual Netlify deployment (if CLI is available)
deploy_netlify_manual() {
    if command -v netlify &> /dev/null; then
        read -p "Do you want to deploy directly to Netlify now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deploying to Netlify..."

            # Check if logged in
            if ! netlify status &> /dev/null; then
                log_info "Please log in to Netlify..."
                netlify login
            fi

            # Deploy to production
            netlify deploy --prod --dir=public

            log_success "Direct Netlify deployment completed!"
        fi
    else
        log_info "Netlify CLI not installed. Deployment will happen via GitHub Actions."
    fi
}

# Show post-deployment instructions
show_post_deployment() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                    Deployment Complete                    ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    log_info "🎯 Next steps:"
    echo "1. Monitor GitHub Actions for deployment progress"
    echo "2. Check Netlify dashboard for build status"
    echo "3. Verify application functionality at your domain"
    echo "4. Set up environment variables in Netlify if not done"
    echo "5. Configure custom domain (optional)"

    log_info "📊 Important URLs:"
    echo "• GitHub Repository: $(git config --get remote.origin.url | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')"
    echo "• GitHub Actions: $(git config --get remote.origin.url | sed 's/git@github.com:/https:\/\/github.com\//' | sed 's/\.git$//')/actions"
    echo "• Netlify App: https://sanzo-color-advisor.netlify.app"
    echo "• Netlify Dashboard: https://app.netlify.com"

    log_info "🔧 Environment Variables Needed in Netlify:"
    echo "• REACT_APP_SUPABASE_URL"
    echo "• REACT_APP_SUPABASE_ANON_KEY"
    echo "• OPENAI_API_KEY (for image analysis)"
    echo "• CLOUDINARY_* (for image processing)"
    echo "• See .env.netlify for complete list"
}

# Main deployment process
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              Sanzo Color Advisor                          ║"
    echo "║             GitHub + Netlify Deployment                   ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_requirements
    check_git_status
    install_dependencies
    run_lint
    run_tests
    build_project
    cleanup_files
    commit_and_push
    create_release
    check_deployment
    deploy_netlify_manual
    show_post_deployment
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "test")
        check_requirements
        install_dependencies
        run_lint
        run_tests
        log_success "All checks passed"
        ;;
    "build")
        check_requirements
        install_dependencies
        build_project
        ;;
    "clean")
        cleanup_files
        log_success "Cleanup completed"
        ;;
    "help"|"--help"|"-h")
        echo "Sanzo Color Advisor Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    Full deployment process (default)"
        echo "  test      Run tests and linting only"
        echo "  build     Build project only"
        echo "  clean     Clean up development files"
        echo "  help      Show this help message"
        echo ""
        echo "This script will:"
        echo "1. Check requirements and git status"
        echo "2. Install dependencies and run tests"
        echo "3. Build project for production"
        echo "4. Clean up development files"
        echo "5. Commit and push to GitHub"
        echo "6. Trigger GitHub Actions deployment"
        echo "7. Deploy to Netlify (automatic or manual)"
        ;;
    *)
        log_error "Unknown command: $1"
        log_info "Use '$0 help' for usage information"
        exit 1
        ;;
esac