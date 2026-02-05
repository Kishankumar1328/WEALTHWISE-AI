# WealthWise AI - Startup Script
# This script builds and starts all services using Docker Compose

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   WealthWise AI - Universal Startup Script    " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
docker version >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor White
    exit 1
}

Write-Host "Docker is running. Starting services..." -ForegroundColor Green

# Build and start services
Write-Host "Building and launching containers (this may take a few minutes)..." -ForegroundColor Yellow
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "   SUCCESS: All services are starting up!      " -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application at:" -ForegroundColor White
    Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  - Backend API: http://localhost:5000/api" -ForegroundColor Cyan
    Write-Host "  - Swagger Docs: http://localhost:5000/api/swagger-ui/index.html" -ForegroundColor Cyan
    Write-Host "  - AI Service: http://localhost:8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To view logs, run: docker-compose logs -f" -ForegroundColor Gray
} else {
    Write-Host "ERROR: Failed to start services." -ForegroundColor Red
}
