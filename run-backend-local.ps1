<#
.SYNOPSIS
    Sets up and runs the WealthWise Backend and Redis locally without Docker.
    Downloads portable versions of Maven and Redis if they are not found.
#>

$ToolsDir = "$PSScriptRoot\.tools"
$MavenVersion = "3.9.6"
$MavenUrl = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
$RedisUrl = "https://github.com/microsoftarchive/redis/releases/download/win-3.0.504/Redis-x64-3.0.504.zip"

# Ensure Tools Directory Exists
if (-not (Test-Path $ToolsDir)) {
    New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null
}

# ---------------------------------------------------------
# 1. SETUP MAVEN
# ---------------------------------------------------------
$MavenHome = "$ToolsDir\apache-maven-$MavenVersion"
$MvnBin = "$MavenHome\bin\mvn.cmd"

if (-not (Test-Path $MvnBin)) {
    Write-Host "Maven not found. Downloading portable Maven..." -ForegroundColor Yellow
    $MavenZip = "$ToolsDir\maven.zip"
    Invoke-WebRequest -Uri $MavenUrl -OutFile $MavenZip
    
    Write-Host "Extracting Maven..." -ForegroundColor Yellow
    Expand-Archive -Path $MavenZip -DestinationPath $ToolsDir -Force
    Remove-Item $MavenZip
}
else {
    Write-Host "Portable Maven found." -ForegroundColor Green
}

# Add Maven to PATH for this session
$env:Path = "$MavenHome\bin;$env:Path"
$env:JAVA_HOME = $env:JAVA_HOME # Ensure JAVA_HOME is passed through

# ---------------------------------------------------------
# 2. SETUP REDIS
# ---------------------------------------------------------
$RedisHome = "$ToolsDir\redis"
$RedisServer = "$RedisHome\redis-server.exe"

if (-not (Test-Path $RedisServer)) {
    Write-Host "Redis not found. Downloading portable Redis..." -ForegroundColor Yellow
    $RedisZip = "$ToolsDir\redis.zip"
    Invoke-WebRequest -Uri $RedisUrl -OutFile $RedisZip
    
    Write-Host "Extracting Redis..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $RedisHome | Out-Null
    Expand-Archive -Path $RedisZip -DestinationPath $RedisHome -Force
    Remove-Item $RedisZip
}
else {
    Write-Host "Portable Redis found." -ForegroundColor Green
}

# ---------------------------------------------------------
# 3. START SERVICES
# ---------------------------------------------------------

# Start Redis in Background
Write-Host "Starting Redis Server..." -ForegroundColor Green
$RedisProcess = Start-Process -FilePath $RedisServer -PassThru -WindowStyle Hidden
Write-Host "Redis running (PID: $($RedisProcess.Id))" -ForegroundColor Gray

# Setup Cleanup
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -SupportEvent -Action {
    Stop-Process -Id $RedisProcess.Id -ErrorAction SilentlyContinue
}

# Check Database Connection (Simple Check)
Write-Host "Ensure your local PostgreSQL is running on port 5432." -ForegroundColor Cyan
Write-Host "Database: wealthwise_db" -ForegroundColor Cyan
Write-Host "User: postgres" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"

# Run Maven
& $MvnBin spring-boot:run

# Cleanup Redis when backend stops
Stop-Process -Id $RedisProcess.Id -ErrorAction SilentlyContinue
