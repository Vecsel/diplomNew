#!/usr/bin/env python3
"""Deploy login hint + diplom demo user on VPS."""
import os
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

FILES = [
    "front/src/pages/login-page.tsx",
    "front/src/lib/i18n/ru.ts",
    "back/src/db/seed.ts",
]


def main() -> int:
    if not PASSWORD:
        print("SSH_PASSWORD not set, skip remote deploy", file=sys.stderr)
        return 0

    tmp = tempfile.NamedTemporaryFile(suffix=".tgz", delete=False)
    tmp.close()
    arc = Path(tmp.name)
    with tarfile.open(arc, "w:gz") as tar:
        for rel in FILES:
            path = ROOT / rel
            tar.add(path, arcname=rel)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    sftp = client.open_sftp()
    sftp.put(str(arc), "/tmp/patch.tgz")
    sftp.close()
    arc.unlink()

    cmd = f"""set -e
cd {REMOTE_DIR}
tar -xzf /tmp/patch.tgz
rm /tmp/patch.tgz
npm run db:seed -w back
npm run build -w front
echo PATCH_OK
"""
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
    if err:
        sys.stderr.buffer.write(err.encode("utf-8", errors="replace"))
    client.close()
    return 0 if "PATCH_OK" in out else 1


if __name__ == "__main__":
    raise SystemExit(main())
