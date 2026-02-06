$ErrorActionPreference = "Stop"

Write-Host "Starting WealthWise AI (Local)..." -ForegroundColor Cyan

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check minimum prerequisites
if (!(Test-Command "node")) { Write-Error "Node.js missing (required for frontend)"; exit 1 }
if (!(Test-Command "npm")) { Write-Error "npm missing (required for frontend)"; exit 1 }
if (!(Test-Command "java")) { Write-Error "Java missing (required for backend)"; exit 1 }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Frontend
Write-Host "Launching Frontend..." -ForegroundColor Green
$frontendPath = Join-Path $scriptDir "frontend"
if (!(Test-Path (Join-Path $frontendPath "node_modules"))) {
    Write-Host "Installing frontend dependencies..."
    Push-Location $frontendPath
    npm install
    Pop-Location
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Start Backend
Write-Host "Launching Backend..." -ForegroundColor Green
$backendPath = Join-Path $scriptDir "backend"
$jarPath = Join-Path $backendPath "target\wealthwise-backend-1.0.0.jar"

if (Test-Command "mvn") {
    # Use Maven if available (preferred for dev)
    Write-Host "Using Maven to run backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; mvn spring-boot:run -Dspring-boot.run.profiles=dev" -WindowStyle Normal
}
elseif (Test-Path $jarPath) {
    # Fallback to JAR if Maven is missing
    Write-Host "Maven not found. Using existing JAR file..." -ForegroundColor Yellow
    Write-Host "Overriding DB config to use localhost..." -ForegroundColor Yellow
    
    # Pass DB config explicitly since the JAR is already compiled
    $dbArgs = "--spring.profiles.active=dev --spring.datasource.url=jdbc:postgresql://localhost:5432/wealthwise_db --spring.datasource.username=postgres --spring.datasource.password=root"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; java -jar '$jarPath' $dbArgs" -WindowStyle Normal
}
else {
    Write-Error "CRITICAL: Maven is missing AND no JAR file found in target/. Cannot start backend."
    Write-Error "Please install Maven to build the project."
    exit 1
}

Start-Sleep -Seconds 2

# 3. Start AI Service
Write-Host "Launching AI Service..." -ForegroundColor Green
$aiServicePath = Join-Path $scriptDir "ai-service"

if (Test-Path $aiServicePath) {
    if (Test-Command "python") {
        $venvPath = Join-Path $scriptDir ".venv"
        $venvPython = Join-Path $venvPath "Scripts\python.exe"
        
        # Self-Healing: Check if venv exists and is valid
        # Setup Environment
        if (Test-Path $venvPython) {
            Write-Host "Using existing Python environment." -ForegroundColor Green
        }
        else {
            Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
            python -m venv $venvPath
        }
        
        # Launch Service with explicit dependency installation steps
        $cmd = "cd '$scriptDir'; " +
        "Write-Host 'Activating virtual environment...' -ForegroundColor Cyan; " +
        ".\.venv\Scripts\Activate.ps1; " +
        "Write-Host 'Updating dependencies...' -ForegroundColor Cyan; " +
        "python -m pip install --upgrade pip; " +
        "cd ai-service; " +
        "pip install -r requirements.txt; " +
        "Write-Host 'Starting AI Service...' -ForegroundColor Green; " +
        "python main.py; " + 
        "if (`$LastExitCode -ne 0) { Write-Host 'Service stopped with error. Press Enter to exit...'; Read-Host }"
               
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WindowStyle Normal
    }
    else {
        Write-Warning "Python not found, skipping AI service."
    }
}

Write-Host "Done."
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend: http://localhost:5000"
