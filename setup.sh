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

if ! docker info &>/dev/null; then
    err "Docker daemon is not running. Please start Docker."
    exit 1
fi
ok "Docker daemon is running"

# --------------------------------------------
# 2. Configure ports
# --------------------------------------------
log "Configuring ports..."
echo ""

if [ -z "${HTTP_PORT:-}" ]; then
    read -rp "  HTTP  port  [80]:   " HTTP_PORT_INPUT
    export HTTP_PORT="${HTTP_PORT_INPUT:-80}"
fi
ok "HTTP  port: $HTTP_PORT"

if [ -z "${HTTPS_PORT:-}" ]; then
    read -rp "  HTTPS port  [443]:  " HTTPS_PORT_INPUT
    export HTTPS_PORT="${HTTPS_PORT_INPUT:-443}"
fi
ok "HTTPS port: $HTTPS_PORT"

if [ -z "${BACKEND_PORT:-}" ]; then
    read -rp "  Backend port [8001]: " BACKEND_PORT_INPUT
    export BACKEND_PORT="${BACKEND_PORT_INPUT:-8001}"
fi
ok "Backend port: $BACKEND_PORT"

if [ -z "${MONGO_PORT:-}" ]; then
    read -rp "  MongoDB port [27017]: " MONGO_PORT_INPUT
    export MONGO_PORT="${MONGO_PORT_INPUT:-27017}"
fi
ok "MongoDB port: $MONGO_PORT"

# --------------------------------------------
# 3. Configure domain / backend URL
# --------------------------------------------
log "Configuring domain..."
echo ""

if [ -z "${REACT_APP_BACKEND_URL:-}" ]; then
    echo "  Enter your domain or server URL."
    echo "  Examples:"
    echo "    - http://localhost              (local, default ports)"
    echo "    - http://localhost:${HTTP_PORT}          (local, custom HTTP port)"
    echo "    - http://your-server-ip:${HTTP_PORT}    (remote, custom port)"
    echo "    - https://your-domain.com       (production with SSL)"
    echo "    - https://your-domain.com:${HTTPS_PORT}  (SSL with custom port)"
    echo ""
    
    # Build a sensible default
    if [ "$HTTP_PORT" = "80" ]; then
        DEFAULT_URL="http://localhost"
    else
        DEFAULT_URL="http://localhost:${HTTP_PORT}"
    fi
    
    read -rp "  Backend URL [$DEFAULT_URL]: " BACKEND_URL_INPUT
    export REACT_APP_BACKEND_URL="${BACKEND_URL_INPUT:-$DEFAULT_URL}"
fi
ok "Backend URL: $REACT_APP_BACKEND_URL"

# --------------------------------------------
# 4. Write .env file
# --------------------------------------------
cat > .env <<EOF
REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
HTTP_PORT=${HTTP_PORT}
HTTPS_PORT=${HTTPS_PORT}
BACKEND_PORT=${BACKEND_PORT}
MONGO_PORT=${MONGO_PORT}
EOF
ok "Created .env file"

# --------------------------------------------
# 5. SSL Certificate check
# --------------------------------------------
log "Checking SSL certificates..."

mkdir -p ssl

if [ -f "ssl/fullchain.pem" ] && [ -s "ssl/fullchain.pem" ] && \
   [ -f "ssl/privkey.pem" ] && [ -s "ssl/privkey.pem" ]; then
    ok "SSL certificates found in ./ssl/"
    warn "Remember to uncomment HTTPS blocks in nginx/default.conf"
    warn "HTTPS will be served on port ${HTTPS_PORT}"
else
    warn "No SSL certificates found in ./ssl/"
    warn "The app will run on HTTP (port ${HTTP_PORT}) only."
    warn ""
    warn "To enable HTTPS later:"
    warn "  1. Place fullchain.pem and privkey.pem in ./ssl/"
    warn "  2. Uncomment HTTPS blocks in nginx/default.conf"
    warn "  3. Update server_name to your domain"
    warn "  4. Run: docker compose restart frontend"
    warn "  HTTPS will then be served on port ${HTTPS_PORT}"
    
    # Create placeholder files so docker-compose volume mount doesn't fail
    touch ssl/fullchain.pem ssl/privkey.pem
fi

# --------------------------------------------
# 6. Verify yarn.lock (generate if missing)
# --------------------------------------------
log "Verifying frontend lock file..."

if [ -f "frontend/yarn.lock" ]; then
    ok "yarn.lock found ($(wc -l < frontend/yarn.lock) lines)"
else
    warn "yarn.lock not found. It will be generated during Docker build."
    ok "Proceeding (Docker handles dependency install)"
fi

# --------------------------------------------
# 7. Build and start containers
# --------------------------------------------
log "Building Docker images (this may take a few minutes)..."
echo ""

docker compose build --no-cache

ok "Docker images built successfully"

log "Starting containers..."

docker compose up -d

# --------------------------------------------
# 8. Wait for services to be healthy
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
    if curl -sf "http://localhost:${BACKEND_PORT}/api/" &>/dev/null; then
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
    if curl -sf "http://localhost:${HTTP_PORT}/health" &>/dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    echo -n "."
    sleep 2
    WAIT=$((WAIT + 2))
done
[ $WAIT -ge $MAX_WAIT ] && echo -e "${RED}timeout${NC}"

# --------------------------------------------
# 9. Done!
# --------------------------------------------
echo ""
echo "============================================"
echo -e "  ${GREEN}Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "  Ports:"
echo "    HTTP     : ${HTTP_PORT}"
echo "    HTTPS    : ${HTTPS_PORT} (enable SSL certs first)"
echo "    Backend  : ${BACKEND_PORT}"
echo "    MongoDB  : ${MONGO_PORT}"
echo ""
echo "  Services:"
echo "    Frontend : http://localhost:${HTTP_PORT}"
echo "    Backend  : http://localhost:${BACKEND_PORT}/api/"
echo "    MongoDB  : localhost:${MONGO_PORT}"
echo ""
echo "  Useful commands:"
echo "    docker compose ps          # Check status"
echo "    docker compose logs -f      # View all logs"
echo "    docker compose logs backend  # Backend logs only"
echo "    docker compose restart       # Restart all"
echo "    docker compose down          # Stop all"
echo "    docker compose down -v       # Stop + remove data"
echo ""
echo "  Access your app at: ${REACT_APP_BACKEND_URL}"
echo ""
