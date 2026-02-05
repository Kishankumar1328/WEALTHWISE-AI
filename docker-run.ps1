# WealthWise AI - Docker Launch Script

Write-Host "Starting WealthWise AI Multi-Container Environment..." -ForegroundColor Cyan

# Find Docker executable
$dockerPath = "docker"
if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
    $standardPath = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
    if (Test-Path $standardPath) {
        $dockerPath = "& '$standardPath'"
        $binDir = [System.IO.Path]::GetDirectoryName($standardPath)
        $env:PATH = "$binDir;" + $env:PATH
        Write-Host "Found Docker at: $standardPath (Added to session PATH)" -ForegroundColor Gray
    }
    else {
        Write-Host "Error: Docker is not installed or not in PATH. Please install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
        exit 1
    }
}

# Check if Docker is running
try {
    $cmd = "$dockerPath info"
    Invoke-Expression $cmd >$null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Error checking Docker status." -ForegroundColor Red
    exit 1
}

# Determine docker-compose command
$composeCmd = "$dockerPath compose"
if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
    $composeCmd = "docker-compose"
}

# Stop existing containers
Write-Host "Cleaning up old containers..." -ForegroundColor Yellow
Invoke-Expression "$composeCmd down"

# Pull images
Write-Host "Pulling base images (Postgres, Redis, Ollama)..." -ForegroundColor Cyan
Invoke-Expression "$composeCmd pull"

# Build and start
Write-Host "Building and starting services (this may take a few minutes)..." -ForegroundColor Green
Invoke-Expression "$composeCmd up --build -d"

Write-Host "Environment started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "AI API:    http://localhost:8000" -ForegroundColor White
Write-Host "Swagger:   http://localhost:5000/api/swagger-ui.html" -ForegroundColor White
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Use 'docker-compose logs -f' to view real-time logs." -ForegroundColor Cyan
