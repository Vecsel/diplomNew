#!/usr/bin/env python3
"""Upload project archive and run server setup (SSH_PASSWORD in env)."""
from __future__ import annotations

import os
import secrets
import sys
import tarfile
import tempfile
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]
HOST = os.environ.get("DEPLOY_HOST", "df4678b5a99.vps.myjino.ru")
PORT = int(os.environ.get("DEPLOY_PORT", "49207"))
USER = os.environ.get("DEPLOY_USER", "root")
PASSWORD = os.environ.get("SSH_PASSWORD", "")
REMOTE_DIR = "/opt/role-control"
DOMAIN = os.environ.get("DEPLOY_DOMAIN", "role-control.ru")

SKIP_DIRS = {
    "node_modules",
    ".git",
    "dist",
    "front/dist",
    "back/dist",
    ".idea",
    "deploy/__pycache__",
}
SKIP_FILES = {".env", "deploy.tgz"}


def should_skip(rel: str) -> bool:
    parts = Path(rel).parts
    if any(p in SKIP_DIRS for p in parts):
        return True
    return Path(rel).name in SKIP_FILES


def make_archive() -> Path:
    tmp = tempfile.NamedTemporaryFile(suffix=".tgz", delete=False)
    tmp.close()
    arc_path = Path(tmp.name)
    with tarfile.open(arc_path, "w:gz") as tar:
        for path in ROOT.rglob("*"):
            if not path.is_file():
                continue
            rel = path.relative_to(ROOT).as_posix()
            if should_skip(rel):
                continue
            tar.add(path, arcname=f"role-control/{rel}")
    return arc_path


def run(client: paramiko.SSHClient, cmd: str) -> tuple[int, str, str]:
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    code = stdout.channel.recv_exit_status()
    return code, out, err


def main() -> int:
    if not PASSWORD:
        print("Set SSH_PASSWORD", file=sys.stderr)
        return 1

    print("Creating archive...")
    arc = make_archive()
    print(f"Archive: {arc} ({arc.stat().st_size // 1024} KB)")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=60)

    print("Uploading...")
    sftp = client.open_sftp()
    remote_arc = "/tmp/role-control.tgz"
    sftp.put(str(arc), remote_arc)
    sftp.close()
    arc.unlink()

    jwt_secret = secrets.token_urlsafe(32)
    db_pass = secrets.token_urlsafe(16)
    setup = f"""set -e
mkdir -p {REMOTE_DIR}
tar -xzf {remote_arc} -C /opt
rm -f {remote_arc}
cd {REMOTE_DIR}

# PostgreSQL role/db
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='rolecontrol'" | grep -q 1 || \\
  sudo -u postgres psql -c "CREATE USER rolecontrol WITH PASSWORD '{db_pass}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='rolecontrol'" | grep -q 1 || \\
  sudo -u postgres psql -c "CREATE DATABASE rolecontrol OWNER rolecontrol;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rolecontrol TO rolecontrol;" 2>/dev/null || true

cat > {REMOTE_DIR}/.env << ENVEOF
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://rolecontrol:{db_pass}@localhost:5432/rolecontrol
JWT_SECRET={jwt_secret}
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://{DOMAIN},http://{DOMAIN},https://www.{DOMAIN},http://www.{DOMAIN}
ENVEOF

cat > {REMOTE_DIR}/front/.env << ENVEOF
VITE_API_URL=https://{DOMAIN}/api
VITE_BASE_PATH=/
ENVEOF

npm install
npm run db:init -w back
npm run db:seed -w back
npm run build -w back 2>/dev/null || true
npm run build -w front

npm install -g pm2 2>/dev/null || true
pm2 delete role-control-api 2>/dev/null || true
cd {REMOTE_DIR}/back
if [ -f dist/server.js ]; then
  pm2 start dist/server.js --name role-control-api
else
  pm2 start ./node_modules/.bin/tsx --name role-control-api -- src/server.ts
fi
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null | tail -1 | bash 2>/dev/null || true

cat > /etc/nginx/conf.d/role-control.conf << 'NGXEOF'
server {{
    listen 80;
    server_name {DOMAIN} www.{DOMAIN};

    root {REMOTE_DIR}/front/dist;
    index index.html;

    location /api/ {{
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}

    location / {{
        try_files $uri $uri/ /index.html;
    }}
}}
NGXEOF

mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak 2>/dev/null || true
nginx -t && systemctl reload nginx

if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d {DOMAIN} -d www.{DOMAIN} --non-interactive --agree-tos -m admin@{DOMAIN} 2>/dev/null || true
  if [ -d /etc/letsencrypt/live/{DOMAIN} ]; then
    sed -i 's|http://{DOMAIN}/api|https://{DOMAIN}/api|' {REMOTE_DIR}/front/.env
    npm run build -w front
    sed -i 's|http://{DOMAIN}|https://{DOMAIN}|g' {REMOTE_DIR}/.env
    pm2 restart role-control-api
  fi
fi

echo "DEPLOY_OK"
echo "Site: http://{DOMAIN} (https if certbot succeeded)"
echo "Admin login: admin / admin123"
"""

    print("Running setup on server (may take several minutes)...")
    code, out, err = run(client, setup)
    sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
    if not out.endswith("\n"):
        sys.stdout.buffer.write(b"\n")
    if err:
        sys.stderr.buffer.write(err.encode("utf-8", errors="replace"))
    client.close()

    if "DEPLOY_OK" not in out:
        print(f"Setup failed with code {code}", file=sys.stderr)
        return code or 1

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
