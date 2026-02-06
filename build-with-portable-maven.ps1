
# Script to Download Maven, Build the Project, and Run it
$ErrorActionPreference = "Stop"

$mavenVersion = "3.9.6"
$mavenUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$mavenVersion/apache-maven-$mavenVersion-bin.zip"
$toolsDir = Join-Path $PSScriptRoot ".tools"
$mavenDir = Join-Path $toolsDir "maven"
$mavenZip = Join-Path $toolsDir "maven.zip"
$backendDir = Join-Path $PSScriptRoot "backend"

# 1. Setup Directories
if (!(Test-Path $toolsDir)) { New-Item -ItemType Directory -Path $toolsDir | Out-Null }

# 2. Download Maven if not present
$mvnExecutable = Join-Path $mavenDir "apache-maven-$mavenVersion\bin\mvn.cmd"

if (!(Test-Path $mvnExecutable)) {
    Write-Host "Downloading Maven $mavenVersion..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip
    
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    Expand-Archive -Path $mavenZip -DestinationPath $mavenDir -Force
    Remove-Item $mavenZip -Force
}

# 3. Build Backend
Write-Host "Building Backend (This will download dependencies)..." -ForegroundColor Green
$buildCmd = "& '$mvnExecutable' -f '$backendDir\pom.xml' clean install -DskipTests"
Invoke-Expression $buildCmd

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build Failed! Please check the logs."
    exit 1
}

# 4. Run Backend
Write-Host "Build Success! Starting Backend..." -ForegroundColor Green
& "$PSScriptRoot\run-backend.ps1"
