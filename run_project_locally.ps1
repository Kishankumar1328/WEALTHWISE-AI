$ErrorActionPreference = "Stop"

Write-Host "Checking for Docker..."
if (!(Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop to run the project locally."
    exit 1
}

Write-Host "Stopping any running containers..."
docker-compose -f docker-compose-local.yml down

Write-Host "Building and Starting Local Environment..."
Write-Host "This will run: Database, Redis, Backend, and Frontend locally."
Write-Host "It connects to LOCAL Database (not Render)."

docker-compose -f docker-compose-local.yml up --build -d

Write-Host "---------------------------------------------------"
Write-Host "🚀 Project started successfully!"
Write-Host "---------------------------------------------------"
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:5000"
Write-Host "Database: localhost:5432 (User: postgres, Pass: root)"
Write-Host "---------------------------------------------------"
Write-Host "To view logs, run: docker-compose -f docker-compose-local.yml logs -f"
