$ErrorActionPreference = "Stop"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WealthWise AI - Backend Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = $PSScriptRoot
$backendDir = Join-Path $scriptDir "backend"
$jarPath = Join-Path $backendDir "target/wealthwise-backend-1.0.0.jar"

# Check Java
if (!(Get-Command "java" -ErrorAction SilentlyContinue)) {
    Write-Error "Java is not installed or not in PATH."
    exit 1
}

# Check JAR
if (!(Test-Path $jarPath)) {
    Write-Error "Compiled JAR file not found at: $jarPath"
    Write-Error "Please install Maven and build the project first."
    exit 1
}

$jarAge = (Get-Date) - (Get-Item $jarPath).LastWriteTime
if ($jarAge.TotalHours -gt 24) {
    Write-Host "WARNING: The Backend JAR file is over 24 hours old!" -ForegroundColor Red
    Write-Host "Recent code changes (like Razorpay) will NOT work." -ForegroundColor Red
    Write-Host "Please rebuild the project: 'mvn clean install'" -ForegroundColor Yellow
    Write-Host "Pausing for 5 seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# Configuration
$dbUrl = "jdbc:postgresql://localhost:5432/wealthwise_db"
$dbUser = "postgres"
$dbPass = "root"

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Database: $dbUrl"
Write-Host "  User:     $dbUser"
Write-Host ""

# Run Application
Write-Host "🚀 Starting Backend on port 5000..." -ForegroundColor Cyan
Write-Host "Using command-line arguments to override database config." -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Cyan

# We use Start-Process to run it in the same window (NoNewWindow) or separated?
# User asked to "run the backend code", usually implies seeing output.
# I'll run it in the current window so you see the logs immediately.

$cmdArgs = @(
    "-jar", "$jarPath",
    "--spring.datasource.url=$dbUrl",
    "--spring.datasource.username=$dbUser",
    "--spring.datasource.password=$dbPass",
    "--server.port=5000"
)

try {
    & java $cmdArgs
}
catch {
    Write-Error "Failed to start backend: $_"
}
