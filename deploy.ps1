# PDF Upload React Application - PowerShell Deployment Script
# Usage: .\deploy.ps1 [frontend|backend|both]

param(
    [Parameter(Position=0)]
    [ValidateSet("frontend", "backend", "both", "status", "logs", "help")]
    [string]$Command = "both"
)

# Configuration
$FrontendDir = "."
$BackendService = "pdfupload-server"
$ProjectId = "famous-store-468216-p6"
$Region = "me-west1"

Write-Host "🚀 PDF Upload React - Deployment Script" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host "📚 Documentation: ./manuals/ directory" -ForegroundColor Yellow

# Function to deploy frontend
function Deploy-Frontend {
    Write-Host "📱 Deploying Frontend to Netlify..." -ForegroundColor Yellow
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ Error: package.json not found. Are you in the correct directory?" -ForegroundColor Red
        exit 1
    }
    
    # Check git status
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "⚠️  Warning: You have uncommitted changes." -ForegroundColor Yellow
        Write-Host "Current changes:" -ForegroundColor Yellow
        git status --short
        
        $response = Read-Host "Do you want to commit these changes? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            $commitMessage = Read-Host "Enter commit message"
            git add .
            git commit -m $commitMessage
        } else {
            Write-Host "❌ Deployment cancelled. Please commit your changes first." -ForegroundColor Red
            exit 1
        }
    }
    
    # Push to GitHub (triggers Netlify deployment)
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Blue
    git push origin main
    
    Write-Host "✅ Frontend deployment triggered!" -ForegroundColor Green
    Write-Host "🌐 Netlify URL: https://coruscating-puppy-056d4c.netlify.app" -ForegroundColor Blue
    Write-Host "⏳ Deployment takes 2-3 minutes..." -ForegroundColor Yellow
}

# Function to deploy backend
function Deploy-Backend {
    Write-Host "🔧 Deploying Backend to Google Cloud Run..." -ForegroundColor Yellow
    
    # Check if gcloud is installed
    try {
        $null = Get-Command gcloud -ErrorAction Stop
    } catch {
        Write-Host "❌ Error: gcloud CLI not found. Please install Google Cloud SDK." -ForegroundColor Red
        exit 1
    }
    
    # Check if user is authenticated
    $authStatus = gcloud auth list --filter=status:ACTIVE --format="value(account)"
    if (-not $authStatus) {
        Write-Host "❌ Error: Not authenticated with gcloud. Please run 'gcloud auth login'" -ForegroundColor Red
        exit 1
    }
    
    # Build and push Docker image
    Write-Host "🐳 Building Docker image..." -ForegroundColor Blue
    gcloud builds submit --tag "gcr.io/$ProjectId/$BackendService"
    
    # Deploy to Cloud Run
    Write-Host "🚀 Deploying to Cloud Run..." -ForegroundColor Blue
    gcloud run deploy $BackendService `
        --image "gcr.io/$ProjectId/$BackendService" `
        --platform managed `
        --region $Region `
        --allow-unauthenticated `
        --set-env-vars "GCS_PROJECT_ID=$ProjectId,GCS_BUCKET_NAME=pdf-upload-myapp"
    
    Write-Host "✅ Backend deployment completed!" -ForegroundColor Green
    Write-Host "🔗 Backend URL: https://pdfupload-server-181115428363.me-west1.run.app" -ForegroundColor Blue
}

# Function to check deployment status
function Check-Status {
    Write-Host "📊 Checking deployment status..." -ForegroundColor Blue
    
    # Check frontend (Netlify)
    Write-Host "📱 Frontend Status:" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "https://coruscating-puppy-056d4c.netlify.app" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is running (HTTP $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "❌ Frontend error (HTTP $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Frontend error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Check backend (Cloud Run)
    Write-Host "🔧 Backend Status:" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "https://pdfupload-server-181115428363.me-west1.run.app/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is running (HTTP $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend error (HTTP $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Backend error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to show logs
function Show-Logs {
    Write-Host "📋 Recent Backend Logs:" -ForegroundColor Blue
    gcloud logs read --service=$BackendService --limit=10 --format="table(timestamp,severity,textPayload)"
}

# Function to show help
function Show-Help {
    Write-Host "Usage:" -ForegroundColor Blue
    Write-Host "  .\deploy.ps1 [frontend|backend|both|status|logs]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Blue
    Write-Host "  frontend  - Deploy frontend to Netlify" -ForegroundColor White
    Write-Host "  backend   - Deploy backend to Cloud Run" -ForegroundColor White
    Write-Host "  both      - Deploy both frontend and backend (default)" -ForegroundColor White
    Write-Host "  status    - Check deployment status" -ForegroundColor White
    Write-Host "  logs      - Show backend logs" -ForegroundColor White
    Write-Host "  help      - Show this help message" -ForegroundColor White
}

# Main script logic
switch ($Command) {
    "frontend" {
        Deploy-Frontend
    }
    "backend" {
        Deploy-Backend
    }
    "both" {
        Deploy-Frontend
        Write-Host ""
        Deploy-Backend
    }
    "status" {
        Check-Status
    }
    "logs" {
        Show-Logs
    }
    "help" {
        Show-Help
    }
}

Write-Host ""
Write-Host "🎉 Deployment script completed!" -ForegroundColor Green
