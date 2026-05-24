# Placeholder directory for SSL certificates
# Place your SSL certificate files here:
#
#   fullchain.pem  - Full certificate chain (cert + intermediates)
#   privkey.pem    - Private key
#
# For Let's Encrypt, these are typically found at:
#   /etc/letsencrypt/live/your-domain.com/fullchain.pem
#   /etc/letsencrypt/live/your-domain.com/privkey.pem
#
# For self-signed testing (DO NOT use in production):
#   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#     -keyout privkey.pem -out fullchain.pem \
#     -subj "/CN=localhost"
#
# Once certs are placed here:
#   1. Uncomment the HTTPS server block in nginx/default.conf
#   2. Uncomment the HTTP->HTTPS redirect in nginx/default.conf
#   3. Update server_name to your domain
#   4. Restart: docker compose restart frontend
