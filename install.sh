#!/usr/bin/env bash
set -euo pipefail

# ─── Resolve project root (directory where this script lives) ───
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
BACKEND_DIR="$PROJECT_DIR/raffler-backend"
RUN_USER="$(logname 2>/dev/null || echo "$SUDO_USER")"

echo "==> Raffler installer"
echo "    Project directory : $PROJECT_DIR"
echo "    Backend directory : $BACKEND_DIR"
echo "    Service user      : $RUN_USER"
echo ""

# ─── Must run as root ───
if [ "$(id -u)" -ne 0 ]; then
  echo "Error: run this script with sudo."
  echo "  sudo bash install.sh"
  exit 1
fi

# ─── 1. Install Node.js 20.x ───
if command -v node &>/dev/null; then
  NODE_VER="$(node -v)"
  echo "==> Node.js already installed ($NODE_VER), skipping."
else
  echo "==> Installing Node.js 20.x ..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  echo "    Installed node $(node -v), npm $(npm -v)"
fi

# ─── 2. Install nginx ───
if command -v nginx &>/dev/null; then
  echo "==> Nginx already installed, skipping."
else
  echo "==> Installing nginx ..."
  apt-get install -y nginx
fi

# ─── 3. Install backend dependencies ───
echo "==> Installing backend npm dependencies ..."
cd "$BACKEND_DIR"
sudo -u "$RUN_USER" npm install --omit=dev

# ─── 4. Write nginx site config ───
NGINX_CONF="/etc/nginx/sites-available/raffler"

echo "==> Writing nginx config to $NGINX_CONF ..."
cat > "$NGINX_CONF" <<NGINX
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root ${PROJECT_DIR};
    index index.html;

    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 10m;
    }

    location /uploads/ {
        alias ${BACKEND_DIR}/uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ =404;
    }
}
NGINX

# Enable site, remove any other configs to avoid conflicts
find /etc/nginx/sites-enabled/ -type l -not -name raffler -delete 2>/dev/null || true
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/raffler

echo "    Testing nginx config ..."
nginx -t

# ─── 5. Write systemd service ───
SERVICE_FILE="/etc/systemd/system/raffler-api.service"

echo "==> Writing systemd service to $SERVICE_FILE ..."
cat > "$SERVICE_FILE" <<SERVICE
[Unit]
Description=Raffler API Backend
After=network.target

[Service]
Type=simple
User=${RUN_USER}
WorkingDirectory=${BACKEND_DIR}
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE

# ─── 6. Start services ───
echo "==> Starting services ..."
systemctl daemon-reload
systemctl enable --now raffler-api
systemctl reload nginx

# ─── 7. Verify ───
sleep 1
if curl -sf http://127.0.0.1:3000/api/stats > /dev/null; then
  echo ""
  echo "==> Installation complete!"
  echo "    API  : http://127.0.0.1:3000/api/stats"
  echo "    Web  : http://$(hostname -I | awk '{print $1}')/"
else
  echo ""
  echo "==> Warning: API did not respond. Check logs with:"
  echo "    journalctl -u raffler-api -f"
fi
