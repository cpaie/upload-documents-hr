#!/bin/bash

# Quick Update Script for PDF Upload React Application
# This script helps with rapid development and deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⚡ Quick Update Script${NC}"
echo "========================"
echo -e "${YELLOW}📚 Documentation: ./manuals/ directory${NC}"

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: Not in the correct directory. Please run this from pdf-upload-react/upload-documents-hr/${NC}"
        exit 1
    fi
}

# Function to check git status
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}📝 You have uncommitted changes:${NC}"
        git status --short
        return 1
    else
        echo -e "${GREEN}✅ Working directory is clean${NC}"
        return 0
    fi
}

# Function to run tests
run_tests() {
    echo -e "${BLUE}🧪 Running tests...${NC}"
    
    # Test configuration
    echo -e "${YELLOW}📋 Testing configuration...${NC}"
    npm run test:config
    
    # Test build
    echo -e "${YELLOW}🔨 Testing build...${NC}"
    npm run build
    
    echo -e "${GREEN}✅ All tests passed!${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}📱 Deploying frontend...${NC}"
    
    # Check if there are changes to commit
    if ! check_git_status; then
        read -p "Do you want to commit these changes? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter commit message: " commit_message
            git add .
            git commit -m "$commit_message"
        else
            echo -e "${RED}❌ Deployment cancelled${NC}"
            exit 1
        fi
    fi
    
    # Push to GitHub
    echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
    git push origin main
    
    echo -e "${GREEN}✅ Frontend deployment triggered!${NC}"
    echo -e "${BLUE}🌐 Netlify URL: https://coruscating-puppy-056d4c.netlify.app${NC}"
}

# Function to deploy backend
deploy_backend() {
    echo -e "${BLUE}🔧 Deploying backend...${NC}"
    
    # Check if gcloud is available
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ gcloud CLI not found${NC}"
        exit 1
    fi
    
    # Build and deploy
    echo -e "${BLUE}🐳 Building and deploying...${NC}"
    gcloud builds submit --tag gcr.io/famous-store-468216-p6/pdfupload-server
    gcloud run deploy pdfupload-server \
        --image gcr.io/famous-store-468216-p6/pdfupload-server \
        --platform managed \
        --region me-west1 \
        --allow-unauthenticated
    
    echo -e "${GREEN}✅ Backend deployment completed!${NC}"
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Application Status:${NC}"
    
    # Frontend status
    echo -e "${YELLOW}📱 Frontend:${NC}"
    curl -s -o /dev/null -w "  Status: %{http_code}\n" https://coruscating-puppy-056d4c.netlify.app
    
    # Backend status
    echo -e "${YELLOW}🔧 Backend:${NC}"
    curl -s -o /dev/null -w "  Status: %{http_code}\n" https://pdfupload-server-181115428363.me-west1.run.app/health
}

# Function to show recent logs
show_logs() {
    echo -e "${BLUE}📋 Recent Backend Logs:${NC}"
    gcloud logs read --service=pdfupload-server --limit=5 --format="table(timestamp,severity,textPayload)"
}

# Function to start development server
start_dev() {
    echo -e "${BLUE}🚀 Starting development server...${NC}"
    npm start
}

# Main script logic
case "${1:-help}" in
    "test")
        check_directory
        run_tests
        ;;
    "frontend")
        check_directory
        deploy_frontend
        ;;
    "backend")
        check_directory
        deploy_backend
        ;;
    "both")
        check_directory
        deploy_frontend
        echo
        deploy_backend
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "dev")
        check_directory
        start_dev
        ;;
    "help"|"-h"|"--help")
        echo -e "${BLUE}Quick Update Commands:${NC}"
        echo "  test     - Run configuration and build tests"
        echo "  frontend - Deploy frontend to Netlify"
        echo "  backend  - Deploy backend to Cloud Run"
        echo "  both     - Deploy both frontend and backend"
        echo "  status   - Check application status"
        echo "  logs     - Show backend logs"
        echo "  dev      - Start development server"
        echo "  help     - Show this help"
        echo
        echo -e "${YELLOW}Examples:${NC}"
        echo "  ./quick-update.sh test     # Test everything"
        echo "  ./quick-update.sh frontend # Deploy frontend only"
        echo "  ./quick-update.sh both     # Deploy everything"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo "Use './quick-update.sh help' for usage information"
        exit 1
        ;;
esac

echo
echo -e "${GREEN}🎉 Quick update completed!${NC}"
