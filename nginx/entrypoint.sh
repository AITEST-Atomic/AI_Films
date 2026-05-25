#!/bin/sh
set -e

# ============================================
# AFM Workshop — Nginx Entrypoint
# Dynamically generates nginx config based on
# environment variables and SSL certificate
# availability.
# ============================================

# ---------- Defaults ----------
SERVER_NAME=${SERVER_NAME:-_}
EXTERNAL_HTTP_PORT=${EXTERNAL_HTTP_PORT:-80}
EXTERNAL_HTTPS_PORT=${EXTERNAL_HTTPS_PORT:-443}
SSL_ENABLED=${SSL_ENABLED:-auto}

# ---------- Auto-detect SSL ----------
if [ "$SSL_ENABLED" = "auto" ]; then
    if [ -f /etc/nginx/ssl/fullchain.pem ] && [ -s /etc/nginx/ssl/fullchain.pem ] && \
       [ -f /etc/nginx/ssl/privkey.pem ]  && [ -s /etc/nginx/ssl/privkey.pem ]; then
        SSL_ENABLED="true"
        echo "[entrypoint] SSL certificates detected — enabling HTTPS."
    else
        SSL_ENABLED="false"
        echo "[entrypoint] No valid SSL certificates found — HTTP-only mode."
    fi
fi

# ---------- Build HTTPS redirect target ----------
# When HTTPS runs on the standard port 443 the port can be omitted.
# For any other port we must include it in the redirect URL.
if [ "$EXTERNAL_HTTPS_PORT" = "443" ]; then
    export HTTPS_REDIRECT_TARGET='https://$host$request_uri'
else
    export HTTPS_REDIRECT_TARGET="https://\$host:${EXTERNAL_HTTPS_PORT}\$request_uri"
fi

# Export remaining vars for envsubst
export SERVER_NAME
export EXTERNAL_HTTP_PORT
export EXTERNAL_HTTPS_PORT

# ---------- Choose template & generate config ----------
TEMPLATE_DIR=/etc/nginx/templates
OUTPUT=/etc/nginx/conf.d/default.conf

if [ "$SSL_ENABLED" = "true" ]; then
    TEMPLATE=${TEMPLATE_DIR}/https.conf.template
else
    TEMPLATE=${TEMPLATE_DIR}/http-only.conf.template
fi

if [ ! -f "$TEMPLATE" ]; then
    echo "[entrypoint] ERROR: Template not found: $TEMPLATE"
    exit 1
fi

# Only substitute our own variables — leave nginx $vars untouched
envsubst '${SERVER_NAME} ${EXTERNAL_HTTP_PORT} ${EXTERNAL_HTTPS_PORT} ${HTTPS_REDIRECT_TARGET}' \
    < "$TEMPLATE" > "$OUTPUT"

echo "[entrypoint] ──────────────────────────────────────"
echo "[entrypoint]  SSL_ENABLED       : $SSL_ENABLED"
echo "[entrypoint]  SERVER_NAME       : $SERVER_NAME"
echo "[entrypoint]  EXTERNAL_HTTP_PORT: $EXTERNAL_HTTP_PORT"
echo "[entrypoint]  EXTERNAL_HTTPS_PORT: $EXTERNAL_HTTPS_PORT"
echo "[entrypoint]  Config written to  : $OUTPUT"
echo "[entrypoint] ──────────────────────────────────────"

# ---------- Hand off to nginx ----------
exec "$@"
