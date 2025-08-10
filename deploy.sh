#!/bin/bash

# PDF Upload React App - Deployment Script
# This script provides easy deployment options for different platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

<<<<<<< HEAD
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
=======
# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Function to build the application
build_app() {
    print_status "Building application for production..."
    npm run build:prod
    print_success "Application built successfully"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    if ! command_exists netlify; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    build_app
    netlify deploy --prod --dir=build
    print_success "Deployed to Netlify successfully"
}

# Function to deploy backend to Google Cloud Run
deploy_backend() {
    print_status "Deploying backend to Google Cloud Run..."
    
    if ! command_exists gcloud; then
        print_error "Google Cloud CLI not found. Please install gcloud first."
        print_status "Download from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Build Docker image for backend
    print_status "Building Docker image for backend..."
    docker build -t gcr.io/YOUR_PROJECT_ID/pdf-upload-backend .
    
    # Tag for Google Container Registry
    docker tag pdf-upload-backend gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest
    
    # Push to Google Container Registry
    print_status "Pushing to Google Container Registry..."
    docker push gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest
    
    # Deploy to Cloud Run
    print_status "Deploying to Cloud Run..."
    gcloud run deploy pdf-upload-backend \
      --image gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --port 8080 \
      --memory 1Gi \
      --cpu 1 \
      --max-instances 10
    
    print_success "Backend deployed to Google Cloud Run successfully"
}

# Function to deploy full stack (frontend + backend)
deploy_fullstack() {
    print_status "Deploying full stack (Frontend + Backend)..."
    
    # Deploy backend first
    deploy_backend
    
    # Get backend URL (you'll need to extract this from the gcloud output)
    print_status "Please note the backend URL from the Cloud Run deployment above"
    print_status "Then update your frontend environment variables with the backend URL"
    
    # Deploy frontend
    deploy_netlify
    
    print_success "Full stack deployment completed"
}

# Function to deploy using Docker
deploy_docker() {
    print_status "Building and running Docker container..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    docker build -t pdf-upload-app .
    docker run -d -p 8080:8080 --name pdf-upload-container pdf-upload-app
    print_success "Docker container running on port 8080"
}

# Function to deploy to traditional server
deploy_server() {
    print_status "Setting up for traditional server deployment..."
    
    build_app
    
    print_status "Build completed. Files are ready in the 'build' directory."
    print_status "You can now upload the 'build' directory to your web server."
    print_status "For backend deployment, use: npm run server:prod"
}

# Function to test locally
test_local() {
    print_status "Testing production build locally..."
    
    build_app
    
    if command_exists serve; then
        print_status "Starting local server..."
        serve -s build -l 3000
    else
        print_warning "Serve not found. Installing..."
        npm install -g serve
        serve -s build -l 3000
    fi
}

# Function to show help
show_help() {
    echo "PDF Upload React App - Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [OPTION]"
    echo ""
    echo "Options:"
echo "  netlify    Deploy frontend to Netlify"
echo "  backend    Deploy backend to Google Cloud Run"
echo "  fullstack  Deploy both frontend and backend"
echo "  docker     Build and run Docker container locally"
echo "  server     Build for traditional server deployment"
echo "  test       Test production build locally"
echo "  build      Build the application only"
echo "  install    Install dependencies only"
echo "  help       Show this help message"
echo ""
echo "Examples:"
echo "  ./deploy.sh netlify    # Deploy frontend only"
echo "  ./deploy.sh backend    # Deploy backend only"
echo "  ./deploy.sh fullstack  # Deploy both frontend and backend"
echo "  ./deploy.sh test       # Test locally"
    echo ""
    echo "Prerequisites:"
    echo "  - Node.js and npm installed"
    echo "  - Git repository initialized"
    echo "  - Environment variables configured"
}

# Main script logic
main() {
    case "${1:-help}" in
        netlify)
            check_prerequisites
            install_dependencies
            deploy_netlify
            ;;
        backend)
            check_prerequisites
            install_dependencies
            deploy_backend
            ;;
        fullstack)
            check_prerequisites
            install_dependencies
            deploy_fullstack
            ;;
        docker)
            check_prerequisites
            install_dependencies
            deploy_docker
            ;;
        server)
            check_prerequisites
            install_dependencies
            deploy_server
            ;;
        test)
            check_prerequisites
            install_dependencies
            test_local
            ;;
        build)
            check_prerequisites
            install_dependencies
            build_app
            ;;
        install)
            check_prerequisites
            install_dependencies
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
>>>>>>> 125ea1c (Add deployment scripts and update documentation for Google Cloud Run + Netlify architecture)
