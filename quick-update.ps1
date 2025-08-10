# Quick Update Script for PDF Upload React Application (PowerShell)
# This script helps with rapid development and deployment on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("test", "frontend", "backend", "both", "status", "logs", "dev", "help")]
    [string]$Command = "help"
)

# Function to check if we're in the right directory
function Test-Directory {
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ Error: Not in the correct directory. Please run this from pdf-upload-react/upload-documents-hr/" -ForegroundColor Red
        exit 1
    }
}

# Function to check git status
function Test-GitStatus {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "📝 You have uncommitted changes:" -ForegroundColor Yellow
        git status --short
        return $false
    } else {
        Write-Host "✅ Working directory is clean" -ForegroundColor Green
        return $true
    }
}

# Function to run tests
function Invoke-Tests {
    Write-Host "🧪 Running tests..." -ForegroundColor Blue
    
    # Test configuration
    Write-Host "📋 Testing configuration..." -ForegroundColor Yellow
    npm run test:config
    
    # Test build
    Write-Host "🔨 Testing build..." -ForegroundColor Yellow
    npm run build
    
    Write-Host "✅ All tests passed!" -ForegroundColor Green
}

# Function to deploy frontend
function Deploy-Frontend {
    Write-Host "📱 Deploying frontend..." -ForegroundColor Blue
    
    # Check if there are changes to commit
    if (-not (Test-GitStatus)) {
        $response = Read-Host "Do you want to commit these changes? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            $commitMessage = Read-Host "Enter commit message"
            git add .
            git commit -m $commitMessage
        } else {
            Write-Host "❌ Deployment cancelled" -ForegroundColor Red
            exit 1
        }
    }
    
    # Push to GitHub
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Blue
    git push origin main
    
    Write-Host "✅ Frontend deployment triggered!" -ForegroundColor Green
    Write-Host "🌐 Netlify URL: https://coruscating-puppy-056d4c.netlify.app" -ForegroundColor Blue
}

# Function to deploy backend
function Deploy-Backend {
    Write-Host "🔧 Deploying backend..." -ForegroundColor Blue
    
    # Check if gcloud is available
    try {
        $null = Get-Command gcloud -ErrorAction Stop
    } catch {
        Write-Host "❌ gcloud CLI not found" -ForegroundColor Red
        exit 1
    }
    
    # Build and deploy
    Write-Host "🐳 Building and deploying..." -ForegroundColor Blue
    gcloud builds submit --tag "gcr.io/famous-store-468216-p6/pdfupload-server"
    gcloud run deploy pdfupload-server `
        --image "gcr.io/famous-store-468216-p6/pdfupload-server" `
        --platform managed `
        --region me-west1 `
        --allow-unauthenticated
    
    Write-Host "✅ Backend deployment completed!" -ForegroundColor Green
}

# Function to show status
function Show-Status {
    Write-Host "📊 Application Status:" -ForegroundColor Blue
    
    # Frontend status
    Write-Host "📱 Frontend:" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "https://coruscating-puppy-056d4c.netlify.app" -UseBasicParsing -TimeoutSec 10
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  Status: Error - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Backend status
    Write-Host "🔧 Backend:" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "https://pdfupload-server-181115428363.me-west1.run.app/health" -UseBasicParsing -TimeoutSec 10
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  Status: Error - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Function to show recent logs
function Show-Logs {
    Write-Host "📋 Recent Backend Logs:" -ForegroundColor Blue
    gcloud logs read --service=pdfupload-server --limit=5 --format="table(timestamp,severity,textPayload)"
}

# Function to start development server
function Start-Dev {
    Write-Host "🚀 Starting development server..." -ForegroundColor Blue
    npm start
}

# Function to show help
function Show-Help {
    Write-Host "Quick Update Commands:" -ForegroundColor Blue
    Write-Host "  test     - Run configuration and build tests" -ForegroundColor White
    Write-Host "  frontend - Deploy frontend to Netlify" -ForegroundColor White
    Write-Host "  backend  - Deploy backend to Cloud Run" -ForegroundColor White
    Write-Host "  both     - Deploy both frontend and backend" -ForegroundColor White
    Write-Host "  status   - Check application status" -ForegroundColor White
    Write-Host "  logs     - Show backend logs" -ForegroundColor White
    Write-Host "  dev      - Start development server" -ForegroundColor White
    Write-Host "  help     - Show this help" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\quick-update.ps1 test     # Test everything" -ForegroundColor White
    Write-Host "  .\quick-update.ps1 frontend # Deploy frontend only" -ForegroundColor White
    Write-Host "  .\quick-update.ps1 both     # Deploy everything" -ForegroundColor White
}

# Main script
Write-Host "⚡ Quick Update Script (PowerShell)" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host "📚 Documentation: ./manuals/ directory" -ForegroundColor Yellow

switch ($Command) {
    "test" {
        Test-Directory
        Invoke-Tests
    }
    "frontend" {
        Test-Directory
        Deploy-Frontend
    }
    "backend" {
        Test-Directory
        Deploy-Backend
    }
    "both" {
        Test-Directory
        Deploy-Frontend
        Write-Host ""
        Deploy-Backend
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "dev" {
        Test-Directory
        Start-Dev
    }
    "help" {
        Show-Help
    }
}

Write-Host ""
Write-Host "Quick update completed!" -ForegroundColor Green
