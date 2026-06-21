#!/usr/bin/env python3
"""Run a shell command on the VPS (credentials via env SSH_PASSWORD)."""
import os
import sys

import paramiko

HOST = os.environ.get("DEPLOY_HOST", "df4678b5a99.vps.myjino.ru")
PORT = int(os.environ.get("DEPLOY_PORT", "49207"))
USER = os.environ.get("DEPLOY_USER", "root")
PASSWORD = os.environ.get("SSH_PASSWORD", "")


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: remote-exec.py <shell command>", file=sys.stderr)
        return 1
    if not PASSWORD:
        print("Set SSH_PASSWORD environment variable", file=sys.stderr)
        return 1

    cmd = " ".join(sys.argv[1:])
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    code = stdout.channel.recv_exit_status()
    if out:
        sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
        if not out.endswith("\n"):
            sys.stdout.buffer.write(b"\n")
    if err:
        sys.stderr.buffer.write(err.encode("utf-8", errors="replace"))
    client.close()
    return code


if __name__ == "__main__":
    raise SystemExit(main())
