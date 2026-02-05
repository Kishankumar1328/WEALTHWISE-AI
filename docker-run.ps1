# WealthWise AI - Docker Launch Script

Write-Host "🚀 Starting WealthWise AI Multi-Container Environment..." -ForegroundColor Cyan

# Check if Docker is running
docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Docker is not installed or not running. Please install Docker Desktop (https://www.docker.com/products/docker-desktop) and start it." -ForegroundColor Red
    exit
}

# Stop existing containers
Write-Host "🧹 Cleaning up old containers..." -ForegroundColor Yellow
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    docker-compose down
}
else {
    docker compose down
}

# Pull images
Write-Host "📥 Pulling base images (Postgres, Redis, Ollama)..." -ForegroundColor Cyan
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    docker-compose pull
}
else {
    docker compose pull
}

# Build and start
Write-Host "🏗️  Building and starting services (this may take a few minutes)..." -ForegroundColor Green
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    docker-compose up --build -d
}
else {
    docker compose up --build -d
}

Write-Host "✅ Environment started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "AI API:    http://localhost:8000" -ForegroundColor White
Write-Host "Swagger:   http://localhost:5000/api/swagger-ui.html" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Use 'docker-compose logs -f' to view real-time logs." -ForegroundColor Cyan
