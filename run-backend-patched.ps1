
# Script to run the backend by patching the old JAR with new classes
# This bypasses the need for Maven integration
$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
$backendDir = Join-Path $scriptDir "backend"
$jarPath = Join-Path $backendDir "target\wealthwise-backend-1.0.0.jar"
$classesDir = Join-Path $backendDir "target\classes"
$distDir = Join-Path $backendDir "dist"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   WealthWise Backend - Hot Patcher" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Check Prerequisites
if (!(Test-Path $jarPath)) {
    Write-Error "Original JAR not found at $jarPath. Cannot patch."
    exit 1
}
if (!(Test-Path $classesDir)) {
    Write-Error "Compiled classes not found at $classesDir. Cannot patch."
    exit 1
}

# 2. Extract JAR (Only if not already extracted)
if (!(Test-Path $distDir)) {
    Write-Host "Extracting JAR dependencies (This takes 30s)..." -ForegroundColor Yellow
    $tempZip = Join-Path $backendDir "target\temp_patch.zip"
    Copy-Item $jarPath $tempZip
    Expand-Archive -Path $tempZip -DestinationPath $distDir -Force
    Remove-Item $tempZip -Force
}
else {
    Write-Host "Using existing extracted dependencies." -ForegroundColor Green
}

# 3. Apply Patch (Copy new classes over old ones)
Write-Host "Patching with latest code..." -ForegroundColor Yellow
Copy-Item -Path "$classesDir\*" -Destination "$distDir\BOOT-INF\classes" -Recurse -Force

# 4. Configure Database
$dbArgs = "--spring.profiles.active=dev --spring.datasource.url=jdbc:postgresql://localhost:5432/wealthwise_db --spring.datasource.username=postgres --spring.datasource.password=root"

# 5. Run
Write-Host "Starting Patched Backend..." -ForegroundColor Green
cd $distDir
# Spring Boot 3.2+ uses this launcher
$javaCmd = "java -cp . org.springframework.boot.loader.launch.JarLauncher $dbArgs"

# Execute
Invoke-Expression $javaCmd
