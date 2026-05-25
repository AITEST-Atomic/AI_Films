#!/usr/bin/env bash
set -euo pipefail

# ============================================
# AFM Workshop — One-Click Deployment Script
# Reads existing .env, shows current values,
# and only changes what the user modifies.
# ============================================

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
DIM='\033[2m'
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
# 0. Load existing .env if present
# --------------------------------------------
ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
    log "Found existing ${ENV_FILE} — loading saved configuration."
    # Source it but ignore errors (comments, blank lines)
    set +e
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
        # Trim whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs | sed 's/^"//;s/"$//')
        # Only export if not already set in the environment
        if [ -z "${!key:-}" ]; then
            export "$key=$value"
        fi
    done < "$ENV_FILE"
    set -e
    echo ""
else
    log "No .env file found — will use defaults."
    echo ""
fi

# Capture what was loaded (or fall back to hardcoded defaults)
PREV_HTTP_PORT="${HTTP_PORT:-80}"
PREV_HTTPS_PORT="${HTTPS_PORT:-443}"
PREV_BACKEND_PORT="${BACKEND_PORT:-8001}"
PREV_MONGO_PORT="${MONGO_PORT:-27017}"
PREV_SERVER_NAME="${SERVER_NAME:-_}"
PREV_SSL_ENABLED="${SSL_ENABLED:-auto}"
PREV_REACT_APP_BACKEND_URL="${REACT_APP_BACKEND_URL:-}"

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
# 2. Show current config & ask to change
# --------------------------------------------
echo ""
echo -e "${CYAN}  ┌──────────────────────────────────────────┐${NC}"
echo -e "${CYAN}  │       Current Configuration               │${NC}"
echo -e "${CYAN}  ├──────────────────────────────────────────┤${NC}"
echo -e "${CYAN}  │${NC}  HTTP_PORT            : ${GREEN}${PREV_HTTP_PORT}${NC}"
echo -e "${CYAN}  │${NC}  HTTPS_PORT           : ${GREEN}${PREV_HTTPS_PORT}${NC}"
echo -e "${CYAN}  │${NC}  BACKEND_PORT         : ${GREEN}${PREV_BACKEND_PORT}${NC}"
echo -e "${CYAN}  │${NC}  MONGO_PORT           : ${GREEN}${PREV_MONGO_PORT}${NC}"
echo -e "${CYAN}  │${NC}  SERVER_NAME          : ${GREEN}${PREV_SERVER_NAME}${NC}"
echo -e "${CYAN}  │${NC}  SSL_ENABLED          : ${GREEN}${PREV_SSL_ENABLED}${NC}"
echo -e "${CYAN}  │${NC}  REACT_APP_BACKEND_URL: ${GREEN}${PREV_REACT_APP_BACKEND_URL:-<not set>}${NC}"
echo -e "${CYAN}  └──────────────────────────────────────────┘${NC}"
echo ""

read -rp "  Do you want to change any settings? [y/N]: " CHANGE_SETTINGS
CHANGE_SETTINGS="${CHANGE_SETTINGS:-n}"

if [[ "$CHANGE_SETTINGS" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "  ${DIM}Press Enter to keep the current value shown in brackets.${NC}"
    echo ""

    # --- Ports ---
    log "Ports"
    read -rp "  HTTP  port  [${PREV_HTTP_PORT}]: " INPUT
    export HTTP_PORT="${INPUT:-$PREV_HTTP_PORT}"

    read -rp "  HTTPS port  [${PREV_HTTPS_PORT}]: " INPUT
    export HTTPS_PORT="${INPUT:-$PREV_HTTPS_PORT}"

    read -rp "  Backend port [${PREV_BACKEND_PORT}]: " INPUT
    export BACKEND_PORT="${INPUT:-$PREV_BACKEND_PORT}"

    read -rp "  MongoDB port [${PREV_MONGO_PORT}]: " INPUT
    export MONGO_PORT="${INPUT:-$PREV_MONGO_PORT}"

    echo ""

    # --- Server name ---
    log "Domain"
    echo "  Enter your domain name (or _ for any)."
    echo "  Examples:  your-domain.com  |  _  (catch-all)"
    read -rp "  Server name [${PREV_SERVER_NAME}]: " INPUT
    export SERVER_NAME="${INPUT:-$PREV_SERVER_NAME}"

    echo ""

    # --- Backend URL ---
    log "Backend URL"
    echo "  The URL your browser will use to reach the app."
    echo "  Examples:"
    echo "    - http://localhost              (local, default ports)"
    echo "    - http://localhost:${HTTP_PORT}          (local, custom HTTP port)"
    echo "    - https://your-domain.com       (production with SSL)"
    echo "    - https://your-domain.com:${HTTPS_PORT}  (SSL with custom port)"

    # Smart default
    if [ -n "$PREV_REACT_APP_BACKEND_URL" ]; then
        DEFAULT_URL="$PREV_REACT_APP_BACKEND_URL"
    elif [ "$HTTP_PORT" = "80" ]; then
        DEFAULT_URL="http://localhost"
    else
        DEFAULT_URL="http://localhost:${HTTP_PORT}"
    fi

    read -rp "  Backend URL [${DEFAULT_URL}]: " INPUT
    export REACT_APP_BACKEND_URL="${INPUT:-$DEFAULT_URL}"

    echo ""
else
    # Keep all previous values
    export HTTP_PORT="$PREV_HTTP_PORT"
    export HTTPS_PORT="$PREV_HTTPS_PORT"
    export BACKEND_PORT="$PREV_BACKEND_PORT"
    export MONGO_PORT="$PREV_MONGO_PORT"
    export SERVER_NAME="$PREV_SERVER_NAME"

    if [ -n "$PREV_REACT_APP_BACKEND_URL" ]; then
        export REACT_APP_BACKEND_URL="$PREV_REACT_APP_BACKEND_URL"
    else
        if [ "$HTTP_PORT" = "80" ]; then
            export REACT_APP_BACKEND_URL="http://localhost"
        else
            export REACT_APP_BACKEND_URL="http://localhost:${HTTP_PORT}"
        fi
    fi

    ok "Keeping existing configuration."
    echo ""
fi

# Print final values
ok "HTTP_PORT            : $HTTP_PORT"
ok "HTTPS_PORT           : $HTTPS_PORT"
ok "BACKEND_PORT         : $BACKEND_PORT"
ok "MONGO_PORT           : $MONGO_PORT"
ok "SERVER_NAME          : $SERVER_NAME"
ok "REACT_APP_BACKEND_URL: $REACT_APP_BACKEND_URL"

# --------------------------------------------
# 3. SSL Certificate check
# --------------------------------------------
echo ""
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
# 4. Write .env file
# --------------------------------------------
cat > "$ENV_FILE" <<EOF
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
ok "Saved configuration to ${ENV_FILE}"

# --------------------------------------------
# 5. Verify yarn.lock (generate if missing)
# --------------------------------------------
log "Verifying frontend lock file..."

if [ -f "frontend/yarn.lock" ]; then
    ok "yarn.lock found ($(wc -l < frontend/yarn.lock) lines)"
else
    warn "yarn.lock not found. It will be generated during Docker build."
    ok "Proceeding (Docker handles dependency install)"
fi

# --------------------------------------------
# 6. Build and start containers
# --------------------------------------------
log "Building Docker images (this may take a few minutes)..."
echo ""

docker compose build --no-cache

ok "Docker images built successfully"

log "Starting containers..."

docker compose up -d

# --------------------------------------------
# 7. Wait for services to be healthy
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
# 8. Summary
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
