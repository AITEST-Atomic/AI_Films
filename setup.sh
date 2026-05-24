#!/usr/bin/env bash
set -euo pipefail

# ============================================
# AFM Workshop - One-Click Deployment Script
# ============================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()   { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "============================================"
echo "  AFM Workshop - Production Deployment"
echo "============================================"
echo ""

# --------------------------------------------
# 1. Check prerequisites
# --------------------------------------------
log "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
    err "Docker is not installed. Please install Docker first."
    err "https://docs.docker.com/engine/install/"
    exit 1
fi
ok "Docker found: $(docker --version)"

if ! command -v docker compose &>/dev/null && ! docker compose version &>/dev/null 2>&1; then
    err "Docker Compose is not installed. Please install Docker Compose."
    err "https://docs.docker.com/compose/install/"
    exit 1
fi
ok "Docker Compose found"

# Check if Docker daemon is running
if ! docker info &>/dev/null; then
    err "Docker daemon is not running. Please start Docker."
    exit 1
fi
ok "Docker daemon is running"

# --------------------------------------------
# 2. Configure environment
# --------------------------------------------
log "Configuring environment..."

# Prompt for domain/URL if not set
if [ -z "${REACT_APP_BACKEND_URL:-}" ]; then
    echo ""
    echo "  Enter your domain or server URL."
    echo "  Examples:"
    echo "    - http://localhost         (local testing)"
    echo "    - http://your-server-ip    (remote server)"
    echo "    - https://your-domain.com  (production with SSL)"
    echo ""
    read -rp "  Backend URL [http://localhost]: " BACKEND_URL_INPUT
    export REACT_APP_BACKEND_URL="${BACKEND_URL_INPUT:-http://localhost}"
fi
ok "Backend URL: $REACT_APP_BACKEND_URL"

# Create .env file for docker-compose
cat > .env <<EOF
REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
EOF
ok "Created .env file"

# --------------------------------------------
# 3. SSL Certificate check
# --------------------------------------------
log "Checking SSL certificates..."

mkdir -p ssl

if [ -f "ssl/fullchain.pem" ] && [ -f "ssl/privkey.pem" ]; then
    ok "SSL certificates found in ./ssl/"
    warn "Remember to uncomment HTTPS blocks in nginx/default.conf"
else
    warn "No SSL certificates found in ./ssl/"
    warn "The app will run on HTTP (port 80) only."
    warn "To enable HTTPS later:"
    warn "  1. Place fullchain.pem and privkey.pem in ./ssl/"
    warn "  2. Uncomment HTTPS blocks in nginx/default.conf"
    warn "  3. Run: docker compose restart frontend"
    
    # Create placeholder files so docker-compose volume mount doesn't fail
    touch ssl/fullchain.pem ssl/privkey.pem
fi

# --------------------------------------------
# 4. Verify yarn.lock exists
# --------------------------------------------
log "Verifying frontend lock file..."

if [ -f "frontend/yarn.lock" ]; then
    ok "yarn.lock found ($(wc -l < frontend/yarn.lock) lines)"
else
    err "yarn.lock not found in frontend/. Build may be non-deterministic."
    warn "Run 'cd frontend && yarn install' to generate it first."
    exit 1
fi

# --------------------------------------------
# 5. Build and start containers
# --------------------------------------------
log "Building Docker images (this may take a few minutes)..."
echo ""

docker compose build --no-cache

ok "Docker images built successfully"

log "Starting containers..."

docker compose up -d

# --------------------------------------------
# 6. Wait for services to be healthy
# --------------------------------------------
log "Waiting for services to start..."

MAX_WAIT=60
WAIT=0

echo -n "  MongoDB: "
while [ $WAIT -lt $MAX_WAIT ]; do
    if docker compose exec -T mongodb mongosh --quiet --eval 'db.runCommand("ping").ok' 2>/dev/null | grep -q 1; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
    WAIT=$((WAIT + 2))
done
[ $WAIT -ge $MAX_WAIT ] && echo -e "${RED}timeout${NC}"

WAIT=0
echo -n "  Backend:  "
while [ $WAIT -lt $MAX_WAIT ]; do
    if curl -sf http://localhost:8001/api/ &>/dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
    WAIT=$((WAIT + 2))
done
[ $WAIT -ge $MAX_WAIT ] && echo -e "${RED}timeout${NC}"

WAIT=0
echo -n "  Frontend: "
while [ $WAIT -lt $MAX_WAIT ]; do
    if curl -sf http://localhost:80/health &>/dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
    WAIT=$((WAIT + 2))
done
[ $WAIT -ge $MAX_WAIT ] && echo -e "${RED}timeout${NC}"

# --------------------------------------------
# 7. Done!
# --------------------------------------------
echo ""
echo "============================================"
echo -e "  ${GREEN}Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "  Services:"
echo "    Frontend : http://localhost (port 80)"
echo "    Backend  : http://localhost:8001/api/"
echo "    MongoDB  : localhost:27017"
echo ""
echo "  Useful commands:"
echo "    docker compose ps          # Check status"
echo "    docker compose logs -f      # View all logs"
echo "    docker compose logs backend  # Backend logs only"
echo "    docker compose restart       # Restart all"
echo "    docker compose down          # Stop all"
echo "    docker compose down -v       # Stop + remove data"
echo ""
if [ "${REACT_APP_BACKEND_URL}" != "http://localhost" ]; then
    echo "  Access your app at: ${REACT_APP_BACKEND_URL}"
else
    echo "  Access your app at: http://localhost"
fi
echo ""
