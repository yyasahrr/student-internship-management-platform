#!/usr/bin/env bash
# ============================================================
#  کارآموزیار — Local Setup Script (PostgreSQL + Django)
#  Run: bash setup-local.sh
# ============================================================
set -e

cd "$(dirname "$0")"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     🎓 کارآموزیار — Local Setup (PostgreSQL)        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ──── Detect OS ────
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo -e "Detected OS: ${GREEN}$OS${NC}"
echo ""

# ──── Step 1: Install PostgreSQL ────
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL already installed${NC}"
    PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
    echo -e "  Version: $PG_VERSION"
else
    echo -e "${YELLOW}Installing PostgreSQL...${NC}"
    
    if [ "$OS" = "macos" ]; then
        if ! command -v brew &> /dev/null; then
            echo -e "${RED}Error: Homebrew not found. Install it first:${NC}"
            echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        brew install postgresql@16
        brew services start postgresql@16
        echo -e "${GREEN}✓ PostgreSQL installed via Homebrew${NC}"
        
    elif [ "$OS" = "linux" ]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            echo -e "${GREEN}✓ PostgreSQL installed via apt${NC}"
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y postgresql-server postgresql
            sudo postgresql-setup --initdb
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            echo -e "${GREEN}✓ PostgreSQL installed via dnf${NC}"
        else
            echo -e "${RED}Error: Unsupported package manager. Install PostgreSQL manually.${NC}"
            exit 1
        fi
        
    elif [ "$OS" = "windows" ]; then
        echo -e "${RED}Error: Please install PostgreSQL manually on Windows:${NC}"
        echo "  Download from: https://www.postgresql.org/download/windows/"
        exit 1
    else
        echo -e "${RED}Error: Unsupported OS. Install PostgreSQL manually.${NC}"
        exit 1
    fi
fi

echo ""

# ──── Step 2: Create Database ────
echo -e "${CYAN}Setting up database...${NC}"

DB_NAME="karamoozyar"
DB_USER="karamoozyar"
DB_PASS="karamoozyar123"

# Check if database exists
if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}✓ Database '$DB_NAME' already exists${NC}"
else
    echo -e "Creating database '$DB_NAME'..."
    
    if [ "$OS" = "macos" ]; then
        createdb "$DB_NAME" 2>/dev/null || echo "  (database may already exist)"
        psql -d "$DB_NAME" -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
        psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
        psql -d "$DB_NAME" -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" 2>/dev/null || true
    else
        sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "  (database may already exist)"
        sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true
        sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;" 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✓ Database created${NC}"
fi

echo ""

# ──── Step 3: Update .env ────
echo -e "${CYAN}Configuring environment...${NC}"

cat > .env << EOF
# کارآموزیار Backend — Local PostgreSQL
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
EOF

echo -e "${GREEN}✓ .env configured${NC}"
echo ""

# ──── Step 4: Python Setup ────
echo -e "${CYAN}Setting up Python environment...${NC}"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

source venv/bin/activate

pip install -q -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ──── Step 5: Migrate ────
echo -e "${CYAN}Running database migrations...${NC}"
python manage.py migrate --noinput
echo -e "${GREEN}✓ Migrations complete${NC}"
echo ""

# ──── Step 6: Seed Data ────
echo -e "${CYAN}Loading sample data...${NC}"
python manage.py seed 2>/dev/null || echo -e "${YELLOW}  (seed data already loaded)${NC}"
echo ""

# ──── Step 7: Start Server ────
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║              ✅ Setup Complete!                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "   API:           ${CYAN}http://localhost:8000/api/${NC}"
echo -e "   Django Admin:  ${CYAN}http://localhost:8000/django-admin/${NC}"
echo ""
echo -e "${YELLOW}📋 Test Accounts:${NC}"
echo "   Admin:    admin@university.ac.ir / admin1234"
echo "   Student:  ali@student.ac.ir / student1234"
echo "   Company:  hr@digikala.com / company1234"
echo ""
echo -e "Starting Django development server..."
echo -e "${CYAN}Press Ctrl+C to stop${NC}"
echo ""

python manage.py runserver 0.0.0.0:8000
