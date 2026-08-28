#!/usr/bin/env bash
# ============================================================
#  کارآموزیار — Quick Start Script
#  Run: bash run.sh
# ============================================================
set -e

cd "$(dirname "$0")"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     🎓 کارآموزیار — سامانه ارتباط دانشگاه و صنعت     ║"
echo "║         Django Backend — Quick Start                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ──── Option 1: Docker Compose (recommended) ────
if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker Compose detected${NC}"
    echo -e "Starting PostgreSQL + Django with Docker..."
    echo ""
    docker compose up --build -d
    echo ""
    echo -e "${GREEN}✅ Backend is running!${NC}"
    echo -e "   API:  ${CYAN}http://localhost:8000/api/${NC}"
    echo -e "   Docs: ${CYAN}http://localhost:8000/api/ (JSON)${NC}"
    echo ""
    echo -e "   Stop:     ${CYAN}docker compose down${NC}"
    echo -e "   Logs:     ${CYAN}docker compose logs -f api${NC}"
    exit 0
fi

# ──── Option 2: Docker Compose (legacy) ────
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ docker-compose (legacy) detected${NC}"
    echo -e "Starting PostgreSQL + Django with Docker..."
    echo ""
    docker-compose up --build -d
    echo ""
    echo -e "${GREEN}✅ Backend is running!${NC}"
    echo -e "   API: ${CYAN}http://localhost:8000/api/${NC}"
    exit 0
fi

# ──── Option 3: Local Python + PostgreSQL ────
echo -e "${YELLOW}⚠ Docker not found. Falling back to local setup.${NC}"
echo ""

# Check Python venv
if [ ! -d "venv" ]; then
    echo -e "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo -e "Installing dependencies..."
pip install -q -r requirements.txt

# Check if PostgreSQL is available locally
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL client detected${NC}"
    export POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
    export POSTGRES_DB="${POSTGRES_DB:-karamoozyar}"
    export POSTGRES_USER="${POSTGRES_USER:-postgres}"
    export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
    export POSTGRES_PORT="${POSTGRES_PORT:-5432}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not found. Using SQLite instead.${NC}"
    echo -e "  To use PostgreSQL, install it and set POSTGRES_HOST in .env"
    unset POSTGRES_HOST
fi

echo -e "Running migrations..."
python manage.py migrate --noinput

echo ""
echo -e "${GREEN}✅ Starting Django development server...${NC}"
echo ""
echo -e "   API:  ${CYAN}http://localhost:8000/api/${NC}"
echo -e "   Admin Panel: ${CYAN}http://localhost:8000/django-admin/${NC}"
echo ""
python manage.py runserver 0.0.0.0:8000
