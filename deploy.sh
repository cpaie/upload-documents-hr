#!/bin/bash

# PDF Upload React Application - Automated Deployment Script
# Usage: ./deploy.sh [frontend|backend|both]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="."
BACKEND_SERVICE="pdfupload-server"
PROJECT_ID="famous-store-468216-p6"
REGION="me-west1"

echo -e "${BLUE}🚀 PDF Upload React - Deployment Script${NC}"
echo "=================================="
echo -e "${YELLOW}📚 Documentation: ./manuals/ directory${NC}"

# Function to deploy frontend
deploy_frontend() {
    echo -e "${YELLOW}📱 Deploying Frontend to Netlify...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: package.json not found. Are you in the correct directory?${NC}"
        exit 1
    fi
    
    # Check git status
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes.${NC}"
        echo "Current changes:"
        git status --short
        read -p "Do you want to commit these changes? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter commit message: " commit_message
            git add .
            git commit -m "$commit_message"
        else
            echo -e "${RED}❌ Deployment cancelled. Please commit your changes first.${NC}"
            exit 1
        fi
    fi
    
    # Push to GitHub (triggers Netlify deployment)
    echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
    git push origin main
    
    echo -e "${GREEN}✅ Frontend deployment triggered!${NC}"
    echo -e "${BLUE}🌐 Netlify URL: https://coruscating-puppy-056d4c.netlify.app${NC}"
    echo -e "${YELLOW}⏳ Deployment takes 2-3 minutes...${NC}"
}

# Function to deploy backend
deploy_backend() {
    echo -e "${YELLOW}🔧 Deploying Backend to Google Cloud Run...${NC}"
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ Error: gcloud CLI not found. Please install Google Cloud SDK.${NC}"
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        echo -e "${RED}❌ Error: Not authenticated with gcloud. Please run 'gcloud auth login'${NC}"
        exit 1
    fi
    
    # Build and push Docker image
    echo -e "${BLUE}🐳 Building Docker image...${NC}"
    gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE
    
    # Deploy to Cloud Run
    echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"
    gcloud run deploy $BACKEND_SERVICE \
        --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars GCS_PROJECT_ID=$PROJECT_ID,GCS_BUCKET_NAME=pdf-upload-myapp
    
    echo -e "${GREEN}✅ Backend deployment completed!${NC}"
    echo -e "${BLUE}🔗 Backend URL: https://pdfupload-server-181115428363.me-west1.run.app${NC}"
}

# Function to check deployment status
check_status() {
    echo -e "${BLUE}📊 Checking deployment status...${NC}"
    
    # Check frontend (Netlify)
    echo -e "${YELLOW}📱 Frontend Status:${NC}"
    curl -s -o /dev/null -w "%{http_code}" https://coruscating-puppy-056d4c.netlify.app | {
        read status
        if [ "$status" = "200" ]; then
            echo -e "${GREEN}✅ Frontend is running (HTTP $status)${NC}"
        else
            echo -e "${RED}❌ Frontend error (HTTP $status)${NC}"
        fi
    }
    
    # Check backend (Cloud Run)
    echo -e "${YELLOW}🔧 Backend Status:${NC}"
    curl -s -o /dev/null -w "%{http_code}" https://pdfupload-server-181115428363.me-west1.run.app/health | {
        read status
        if [ "$status" = "200" ]; then
            echo -e "${GREEN}✅ Backend is running (HTTP $status)${NC}"
        else
            echo -e "${RED}❌ Backend error (HTTP $status)${NC}"
        fi
    }
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Recent Backend Logs:${NC}"
    gcloud logs read --service=$BACKEND_SERVICE --limit=10 --format="table(timestamp,severity,textPayload)"
}

# Main script logic
case "${1:-both}" in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "both")
        deploy_frontend
        echo
        deploy_backend
        ;;
    "status")
        check_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        echo -e "${BLUE}Usage:${NC}"
        echo "  ./deploy.sh [frontend|backend|both|status|logs]"
        echo
        echo -e "${BLUE}Commands:${NC}"
        echo "  frontend  - Deploy frontend to Netlify"
        echo "  backend   - Deploy backend to Cloud Run"
        echo "  both      - Deploy both frontend and backend (default)"
        echo "  status    - Check deployment status"
        echo "  logs      - Show backend logs"
        echo "  help      - Show this help message"
        ;;
    *)
        echo -e "${RED}❌ Invalid option: $1${NC}"
        echo "Use './deploy.sh help' for usage information"
        exit 1
        ;;
esac

echo
echo -e "${GREEN}🎉 Deployment script completed!${NC}"
