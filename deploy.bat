@echo off
setlocal enabledelayedexpansion

REM PDF Upload React App - Deployment Script for Windows
REM This script provides easy deployment options for different platforms

echo PDF Upload React App - Deployment Script for Windows
echo.

if "%1"=="" goto show_help
if "%1"=="help" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

if "%1"=="netlify" goto deploy_netlify
if "%1"=="backend" goto deploy_backend
if "%1"=="fullstack" goto deploy_fullstack
if "%1"=="docker" goto deploy_docker
if "%1"=="server" goto deploy_server
if "%1"=="test" goto test_local
if "%1"=="build" goto build_app
if "%1"=="install" goto install_dependencies

echo [ERROR] Unknown option: %1
goto show_help

:show_help
echo Usage: deploy.bat [OPTION]
echo.
echo Options:
echo   netlify    Deploy frontend to Netlify
echo   backend    Deploy backend to Google Cloud Run
echo   fullstack  Deploy both frontend and backend
echo   docker     Build and run Docker container locally
echo   server     Build for traditional server deployment
echo   test       Test production build locally
echo   build      Build the application only
echo   install    Install dependencies only
echo   help       Show this help message
echo.
echo Examples:
echo   deploy.bat netlify    # Deploy frontend only
echo   deploy.bat backend    # Deploy backend only
echo   deploy.bat fullstack  # Deploy both frontend and backend
echo   deploy.bat test       # Test locally
echo.
echo Prerequisites:
echo   - Node.js and npm installed
echo   - Git repository initialized
echo   - Environment variables configured
goto :eof

:check_prerequisites
echo [INFO] Checking prerequisites...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    exit /b 1
)
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)
echo [SUCCESS] Prerequisites check passed
goto :eof

:install_dependencies
echo [INFO] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed
goto :eof

:build_app
echo [INFO] Building application for production...
set NODE_ENV=production
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    exit /b 1
)
echo [SUCCESS] Application built successfully
goto :eof

:deploy_netlify
call :check_prerequisites
call :install_dependencies
echo [INFO] Deploying to Netlify...
where netlify >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Netlify CLI not found. Installing...
    call npm install -g netlify-cli
)
call :build_app
call netlify deploy --prod --dir=build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Netlify
    exit /b 1
)
echo [SUCCESS] Deployed to Netlify successfully
goto :eof

:deploy_backend
call :check_prerequisites
call :install_dependencies
echo [INFO] Deploying backend to Google Cloud Run...
where gcloud >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Google Cloud CLI not found. Please install gcloud first.
    echo [INFO] Download from: https://cloud.google.com/sdk/docs/install
    exit /b 1
)
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)
echo [INFO] Building Docker image for backend...
call docker build -t gcr.io/YOUR_PROJECT_ID/pdf-upload-backend .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker image
    exit /b 1
)
call docker tag pdf-upload-backend gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest
echo [INFO] Pushing to Google Container Registry...
call docker push gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push to Google Container Registry
    exit /b 1
)
echo [INFO] Deploying to Cloud Run...
call gcloud run deploy pdf-upload-backend --image gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest --platform managed --region us-central1 --allow-unauthenticated --port 8080 --memory 1Gi --cpu 1 --max-instances 10
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Cloud Run
    exit /b 1
)
echo [SUCCESS] Backend deployed to Google Cloud Run successfully
goto :eof

:deploy_fullstack
call :check_prerequisites
call :install_dependencies
echo [INFO] Deploying full stack (Frontend + Backend)...
call :deploy_backend
echo [INFO] Please note the backend URL from the Cloud Run deployment above
echo [INFO] Then update your frontend environment variables with the backend URL
call :deploy_netlify
echo [SUCCESS] Full stack deployment completed
goto :eof

:deploy_docker
call :check_prerequisites
call :install_dependencies
echo [INFO] Building and running Docker container...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)
call docker build -t pdf-upload-app .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker image
    exit /b 1
)
call docker run -d -p 8080:8080 --name pdf-upload-container pdf-upload-app
if %errorlevel% neq 0 (
    echo [ERROR] Failed to run Docker container
    exit /b 1
)
echo [SUCCESS] Docker container running on port 8080
goto :eof

:deploy_server
call :check_prerequisites
call :install_dependencies
echo [INFO] Setting up for traditional server deployment...
call :build_app
echo [INFO] Build completed. Files are ready in the 'build' directory.
echo [INFO] You can now upload the 'build' directory to your web server.
echo [INFO] For backend deployment, use: npm run server:prod
goto :eof

:test_local
call :check_prerequisites
call :install_dependencies
echo [INFO] Testing production build locally...
call :build_app
where serve >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting local server...
    call serve -s build -l 3000
) else (
    echo [WARNING] Serve not found. Installing...
    call npm install -g serve
    call serve -s build -l 3000
)
goto :eof
