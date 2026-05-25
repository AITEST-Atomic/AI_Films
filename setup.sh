#!/usr/bin/env bash
set -euo pipefail

# ============================================
# AFM Workshop — One-Click Deployment Script
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
echo "  AFM Workshop — Production Deployment"
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
    read -rp "  HTTP  port  [80]:    " HTTP_PORT_INPUT
    export HTTP_PORT="${HTTP_PORT_INPUT:-80}"
fi
ok "HTTP  port: $HTTP_PORT"

if [ -z "${HTTPS_PORT:-}" ]; then
    read -rp "  HTTPS port  [443]:   " HTTPS_PORT_INPUT
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
# 3. Configure domain / server name
# --------------------------------------------
log "Configuring domain..."
echo ""

if [ -z "${SERVER_NAME:-}" ]; then
    echo "  Enter your domain name (or _ for any)."
    echo "  Examples:  your-domain.com  |  _  (catch-all)"
    read -rp "  Server name [_]: " SERVER_NAME_INPUT
    export SERVER_NAME="${SERVER_NAME_INPUT:-_}"
fi
ok "Server name: $SERVER_NAME"

# --------------------------------------------
# 4. Configure backend URL
# --------------------------------------------
log "Configuring backend URL..."
echo ""

if [ -z "${REACT_APP_BACKEND_URL:-}" ]; then
    echo "  The URL your browser will use to reach the app."
    echo "  Examples:"
    echo "    - http://localhost              (local, default ports)"
    echo "    - http://localhost:${HTTP_PORT}          (local, custom HTTP port)"
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
# 5. SSL Certificate check
# --------------------------------------------
log "Checking SSL certificates..."

mkdir -p ssl

SSL_READY=false
if [ -f "ssl/fullchain.pem" ] && [ -s "ssl/fullchain.pem" ] && \
   [ -f "ssl/privkey.pem" ]  && [ -s "ssl/privkey.pem" ]; then
    SSL_READY=true
    ok "SSL certificates found in ./ssl/"
    echo ""
    echo "  HTTPS will be available on port ${HTTPS_PORT}"
    echo "  HTTP→HTTPS redirect is enabled automatically."
    if [ "$HTTPS_PORT" != "443" ]; then
        echo "  Note: Custom HTTPS port detected (${HTTPS_PORT})."
        echo "        Redirects will include the port number."
    fi
else
    warn "No valid SSL certificates found in ./ssl/"
    warn "The app will run on HTTP (port ${HTTP_PORT}) only."
    echo ""
    warn "To enable HTTPS later:"
    warn "  1. Place fullchain.pem and privkey.pem in ./ssl/"
    warn "  2. Restart:  docker compose restart frontend"
    warn "  HTTPS will automatically be enabled on port ${HTTPS_PORT}."
    echo ""
    warn "For self-signed testing certs (NOT for production):"
    warn "  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
    warn "    -keyout ssl/privkey.pem -out ssl/fullchain.pem \\"
    warn "    -subj \"/CN=localhost\""
fi

# Determine SSL_ENABLED value for docker-compose
if [ "$SSL_READY" = true ]; then
    export SSL_ENABLED="true"
else
    export SSL_ENABLED="false"
fi

# --------------------------------------------
# 6. Write .env file
# --------------------------------------------
cat > .env <<EOF
# AFM Workshop — Docker Compose Environment
# Generated by setup.sh on $(date -Iseconds)

# External ports (host → container)
HTTP_PORT=${HTTP_PORT}
HTTPS_PORT=${HTTPS_PORT}
BACKEND_PORT=${BACKEND_PORT}
MONGO_PORT=${MONGO_PORT}

# Nginx configuration
SERVER_NAME=${SERVER_NAME}
SSL_ENABLED=${SSL_ENABLED}

# Frontend build-time URL
REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
EOF
ok "Created .env file"

# --------------------------------------------
# 7. Verify yarn.lock (generate if missing)
# --------------------------------------------
log "Verifying frontend lock file..."

if [ -f "frontend/yarn.lock" ]; then
    ok "yarn.lock found ($(wc -l < frontend/yarn.lock) lines)"
else
    warn "yarn.lock not found. It will be generated during Docker build."
    ok "Proceeding (Docker handles dependency install)"
fi

# --------------------------------------------
# 8. Build and start containers
# --------------------------------------------
log "Building Docker images (this may take a few minutes)..."
echo ""

docker compose build --no-cache

ok "Docker images built successfully"

log "Starting containers..."

docker compose up -d

# --------------------------------------------
# 9. Wait for services to be healthy
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
# 10. Summary
# --------------------------------------------
echo ""
echo "============================================"
echo -e "  ${GREEN}Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "  Ports:"
echo "    HTTP     : ${HTTP_PORT}"
echo "    HTTPS    : ${HTTPS_PORT} $([ "$SSL_READY" = true ] && echo "(enabled)" || echo "(no certs — disabled)")"
echo "    Backend  : ${BACKEND_PORT}"
echo "    MongoDB  : ${MONGO_PORT}"
echo ""
echo "  Services:"
if [ "$SSL_READY" = true ]; then
    if [ "$HTTPS_PORT" = "443" ]; then
        echo "    Frontend : https://localhost"
    else
        echo "    Frontend : https://localhost:${HTTPS_PORT}"
    fi
    echo "    (HTTP→HTTPS redirect active on port ${HTTP_PORT})"
else
    if [ "$HTTP_PORT" = "80" ]; then
        echo "    Frontend : http://localhost"
    else
        echo "    Frontend : http://localhost:${HTTP_PORT}"
    fi
fi
echo "    Backend  : http://localhost:${BACKEND_PORT}/api/"
echo "    MongoDB  : localhost:${MONGO_PORT}"
echo ""
echo "  Useful commands:"
echo "    docker compose ps           # Check status"
echo "    docker compose logs -f      # View all logs"
echo "    docker compose logs frontend # Frontend/nginx logs"
echo "    docker compose restart      # Restart all"
echo "    docker compose down         # Stop all"
echo "    docker compose down -v      # Stop + remove data"
echo ""
echo "  Access your app at: ${REACT_APP_BACKEND_URL}"
echo ""
