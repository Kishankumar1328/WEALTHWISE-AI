# WealthWise AI - Docker Launch Script

Write-Host "🚀 Starting WealthWise AI Multi-Container Environment..." -ForegroundColor Cyan

# Check if Docker is running
docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit
}

# Stop existing containers
Write-Host "🧹 Cleaning up old containers..." -ForegroundColor Yellow
docker-compose down

# Build and start
Write-Host "🏗️  Building and starting services (this may take a few minutes)..." -ForegroundColor Green
docker-compose up --build -d

Write-Host "✅ Environment started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor Grey
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "AI API:    http://localhost:8000" -ForegroundColor White
Write-Host "Swagger:   http://localhost:5000/api/swagger-ui.html" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Grey
Write-Host ""
Write-Host "Use 'docker-compose logs -f' to view real-time logs." -ForegroundColor Cyan
