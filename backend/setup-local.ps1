# ============================================================
#  کارآموزیار — Windows PowerShell Setup Script
#  Run: .\setup-local.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  کارآموزیار — Windows Setup (PostgreSQL + Django)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# ──── Step 1: Check Python ────
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pyVersion = python --version 2>&1
    Write-Host "  ✓ $pyVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found!" -ForegroundColor Red
    Write-Host "  Install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  Make sure to check 'Add Python to PATH' during installation." -ForegroundColor Yellow
    exit 1
}

# ──── Step 2: Check PostgreSQL ────
Write-Host ""
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow

$pgFound = $false

# Check if psql is in PATH
if (Get-Command psql -ErrorAction SilentlyContinue) {
    $pgVersion = psql --version 2>&1
    Write-Host "  ✓ $pgVersion" -ForegroundColor Green
    $pgFound = $true
} else {
    # Check common install locations
    $pgPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "C:\Program Files\PostgreSQL\13\bin\psql.exe"
    )
    foreach ($path in $pgPaths) {
        if (Test-Path $path) {
            $env:PATH += ";$(Split-Path $path)"
            $pgVersion = & $path --version 2>&1
            Write-Host "  ✓ Found: $pgVersion" -ForegroundColor Green
            Write-Host "    Path: $path" -ForegroundColor Gray
            $pgFound = $true
            break
        }
    }
}

if (-not $pgFound) {
    Write-Host "  ✗ PostgreSQL not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Please install PostgreSQL from:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "  Or use the EDB installer:" -ForegroundColor Yellow
    Write-Host "  https://www.enterprisedb.com/downloads/postgres-postgresql-downloads" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  During installation, note the password you set for 'postgres' user." -ForegroundColor Yellow
    Write-Host ""

    $install = Read-Host "  Do you want to open the download page? (y/n)"
    if ($install -eq "y") {
        Start-Process "https://www.enterprisedb.com/downloads/postgres-postgresql-downloads"
    }
    exit 1
}

# ──── Step 3: Create Database ────
Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow

$DB_NAME = "karamoozyar"
$DB_USER = "karamoozyar"
$DB_PASS = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { [guid]::NewGuid().ToString("N") }

# Ask for postgres superuser password
Write-Host ""
$pgPassword = Read-Host "  Enter PostgreSQL 'postgres' superuser password"

$env:PGPASSWORD = $pgPassword

# Check if database exists
$existingDb = psql -U postgres -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>$null
if ($existingDb -eq "1") {
    Write-Host "  ✓ Database '$DB_NAME' already exists" -ForegroundColor Green
} else {
    Write-Host "  Creating database '$DB_NAME'..." -ForegroundColor Yellow

    psql -U postgres -h localhost -c "CREATE DATABASE $DB_NAME;" 2>$null
    psql -U postgres -h localhost -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>$null
    psql -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>$null
    psql -U postgres -h localhost -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" 2>$null

    Write-Host "  ✓ Database created" -ForegroundColor Green
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

# ──── Step 4: Configure .env ────
Write-Host ""
Write-Host "Configuring environment..." -ForegroundColor Yellow

@"
# کارآموزیار Backend — Local PostgreSQL (Windows)
DEBUG=True
DJANGO_SECRET_KEY=local-dev-secret-key-change-in-production

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_DB=$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASS
POSTGRES_PORT=5432

# CORS
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:3001
"@ | Out-File -Encoding utf8 -FilePath ".env"

Write-Host "  ✓ .env configured" -ForegroundColor Green

# ──── Step 5: Python Virtual Environment ────
Write-Host ""
Write-Host "Setting up Python environment..." -ForegroundColor Yellow

if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "  ✓ Virtual environment created" -ForegroundColor Green
}

# Activate venv (PowerShell)
& .\venv\Scripts\Activate.ps1

pip install -q -r requirements.txt
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green

# ──── Step 6: Migrate ────
Write-Host ""
Write-Host "Running migrations..." -ForegroundColor Yellow
python manage.py migrate --noinput
Write-Host "  ✓ Migrations complete" -ForegroundColor Green

# ──── Done! ────
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "           Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  API:          http://localhost:8000/api/" -ForegroundColor Cyan
Write-Host "  Django Admin: http://localhost:8000/django-admin/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting server... (Press Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host ""

python manage.py runserver 0.0.0.0:8000
