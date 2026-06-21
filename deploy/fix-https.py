#!/usr/bin/env python3
"""Rebuild frontend with HTTPS API URL on VPS."""
import os
import sys

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "df4678b5a99.vps.myjino.ru")
PORT = int(os.environ.get("DEPLOY_PORT", "49207"))
USER = os.environ.get("DEPLOY_USER", "root")
PASSWORD = os.environ.get("SSH_PASSWORD", "")
DOMAIN = os.environ.get("DEPLOY_DOMAIN", "role-control.ru")
REMOTE_DIR = "/opt/role-control"


def main() -> int:
    if not PASSWORD:
        print("Set SSH_PASSWORD", file=sys.stderr)
        return 1

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)

    cmd = f"""set -e
cd {REMOTE_DIR}
cat > front/.env << EOF
VITE_API_URL=https://{DOMAIN}/api
VITE_BASE_PATH=/
EOF
npm run build -w front
grep -l 'https://{DOMAIN}/api' front/dist/assets/*.js && echo REBUILD_OK
curl -s https://{DOMAIN}/api/health
"""
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    code = stdout.channel.recv_exit_status()
    sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
    if err:
        sys.stderr.buffer.write(err.encode("utf-8", errors="replace"))
    client.close()
    return 0 if "REBUILD_OK" in out else code


if __name__ == "__main__":
    raise SystemExit(main())
