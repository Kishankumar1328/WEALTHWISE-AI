$ErrorActionPreference = "Stop"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WealthWise AI - Service Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = $PSScriptRoot
$aiDir = Join-Path $scriptDir "ai-service"
$venvDir = Join-Path $scriptDir ".venv"

# 1. Check Python
if (!(Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed or not in PATH."
    exit 1
}

# 2. Setup Environment
if (Test-Path $venvDir) {
    Write-Host "Using existing virtual environment..." -ForegroundColor Green
}
else {
    Write-Host "Creating new virtual environment..." -ForegroundColor Yellow
    python -m venv $venvDir
}

# 3. Activate & Install
Write-Host "Activating environment..." -ForegroundColor Green
. "$venvDir\Scripts\Activate.ps1"

Write-Host "Upgrading pip..." -ForegroundColor Green
python -m pip install --upgrade pip

Write-Host "Installing requirements..." -ForegroundColor Green
Set-Location $aiDir
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
}
else {
    Write-Error "requirements.txt not found in ai-service directory!"
    exit 1
}

# 4. Run Application
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "🚀 Starting AI Service on port 8000..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

python main.py
