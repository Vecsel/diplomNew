#!/usr/bin/env python3
import os
import sys
from pathlib import Path

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "df4678b5a99.vps.myjino.ru")
PORT = int(os.environ.get("DEPLOY_PORT", "49207"))
USER = os.environ.get("DEPLOY_USER", "root")
PASSWORD = os.environ.get("SSH_PASSWORD", "")
CONF = Path(__file__).parent / "nginx-role-control.conf"


def main() -> int:
    if not PASSWORD:
        print("Set SSH_PASSWORD", file=sys.stderr)
        return 1
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    sftp = client.open_sftp()
    sftp.put(str(CONF), "/etc/nginx/conf.d/role-control.conf")
    sftp.close()
    for cmd in [
        "mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak 2>/dev/null || true",
        "nginx -t && systemctl reload nginx",
        "curl -s -H 'Host: role-control.ru' http://127.0.0.1/api/health",
    ]:
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        code = stdout.channel.recv_exit_status()
        sys.stdout.buffer.write(out.encode())
        if err:
            sys.stderr.buffer.write(err.encode())
        if code != 0 and "nginx -t" in cmd:
            return code
    client.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
