# SSL Certificates

Place your SSL certificate files here:

| File            | Description                                       |
|-----------------|---------------------------------------------------|
| `fullchain.pem` | Full certificate chain (cert + intermediates)     |
| `privkey.pem`   | Private key                                       |

## How it works

The nginx entrypoint script (`nginx/entrypoint.sh`) **auto-detects** these files at container startup:

- **Certs found & non-empty** → HTTPS enabled, HTTP→HTTPS redirect activated
- **Certs missing or empty** → HTTP-only mode (graceful fallback)

No manual config editing needed — just place the files and restart:

```bash
docker compose restart frontend
```

## Using Custom Ports

Set ports via environment variables (in `.env` or `setup.sh`):

```bash
# .env example
HTTP_PORT=8080       # External HTTP port  (host:8080 → container:80)
HTTPS_PORT=8443      # External HTTPS port (host:8443 → container:443)
```

The HTTP→HTTPS redirect automatically includes the correct port:
- Standard port 443 → `https://example.com/path`
- Custom port 8443  → `https://example.com:8443/path`

## Quick Start: Self-Signed Certs (Dev/Testing Only)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem -out ssl/fullchain.pem \
  -subj "/CN=localhost"
```

Then restart:
```bash
docker compose restart frontend
```

## Let's Encrypt (Production)

Certificates are typically at:
```
/etc/letsencrypt/live/your-domain.com/fullchain.pem
/etc/letsencrypt/live/your-domain.com/privkey.pem
```

Copy or symlink them into this directory, then restart.

## Environment Variables

| Variable             | Default | Description                                    |
|----------------------|---------|------------------------------------------------|
| `HTTP_PORT`          | `80`    | Host port for HTTP                             |
| `HTTPS_PORT`         | `443`   | Host port for HTTPS                            |
| `SERVER_NAME`        | `_`     | Nginx server_name (domain or `_` for any)      |
| `SSL_ENABLED`        | `auto`  | `auto` (detect certs), `true`, or `false`      |
