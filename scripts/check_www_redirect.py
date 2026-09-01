#!/usr/bin/env python3
"""Regression check for the www -> apex redirect on EasyTarget."""

from __future__ import annotations

import argparse
import http.client
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

CANONICAL_HOST = "easytarget.com.ua"
WWW_HOST = "www.easytarget.com.ua"
DEFAULT_PORT = 8788


@dataclass(frozen=True)
class CheckResult:
    status: int
    location: str
    body: str


def request(base_host: str, port: int, host_header: str, path: str) -> CheckResult:
    conn = http.client.HTTPConnection(base_host, port, timeout=10)
    conn.request("GET", path, headers={"Host": host_header, "Connection": "close"})
    resp = conn.getresponse()
    body = resp.read().decode("utf-8", errors="replace")
    location = resp.getheader("Location", "") or ""
    conn.close()
    return CheckResult(status=resp.status, location=location, body=body)


def wait_for_server(
    base_host: str,
    port: int,
    proc: subprocess.Popen[str],
    timeout_s: int = 60,
) -> None:
    deadline = time.time() + timeout_s
    last_error: Exception | None = None
    while time.time() < deadline:
        exit_code = proc.poll()
        if exit_code is not None:
            raise RuntimeError(f"Pages dev server exited during startup with code {exit_code}")
        try:
            conn = http.client.HTTPConnection(base_host, port, timeout=2)
            conn.request("GET", "/", headers={"Host": CANONICAL_HOST, "Connection": "close"})
            resp = conn.getresponse()
            resp.read()
            conn.close()
            if resp.status in {200, 301, 302, 307, 308}:
                return
        except Exception as exc:  # pragma: no cover - transient startup probe
            last_error = exc
        time.sleep(0.5)
    raise TimeoutError(f"Pages dev server did not become ready within {timeout_s}s: {last_error}")


def assert_redirect(port: int, path: str) -> None:
    probe = request("127.0.0.1", port, WWW_HOST, path)
    expected_location = f"https://{CANONICAL_HOST}{path}"
    if probe.status not in {301, 308}:
        raise AssertionError(f"{path}: expected 301/308 from {WWW_HOST}, got {probe.status}")
    if probe.location != expected_location:
        raise AssertionError(f"{path}: expected Location {expected_location!r}, got {probe.location!r}")

    follow = urlsplit(probe.location)
    follow_path = follow.path or "/"
    if follow.query:
        follow_path = f"{follow_path}?{follow.query}"
    apex = request("127.0.0.1", port, CANONICAL_HOST, follow_path)
    if apex.status != 200:
        raise AssertionError(f"{path}: follow-up apex request returned {apex.status}, expected 200")


def assert_apex_unchanged(port: int, path: str) -> None:
    probe = request("127.0.0.1", port, CANONICAL_HOST, path)
    if probe.status != 200:
        raise AssertionError(f"{path}: expected 200 on apex, got {probe.status}")
    if probe.location:
        raise AssertionError(f"{path}: apex should not redirect, but returned Location {probe.location!r}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", default="hugo/public", help="Pages build output directory")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    args = parser.parse_args()

    repo = Path(__file__).resolve().parents[1]
    build_dir = (repo / args.build_dir).resolve()
    if not build_dir.is_dir():
        print(f"Missing build directory: {build_dir}", file=sys.stderr)
        return 2

    wrangler_bin = shutil.which("wrangler")
    cmd = ([wrangler_bin] if wrangler_bin else ["npx", "wrangler"]) + [
        "pages",
        "dev",
        str(build_dir),
        "--ip",
        "127.0.0.1",
        "--port",
        str(args.port),
    ]
    proc = subprocess.Popen(
        cmd,
        cwd=str(repo),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        start_new_session=True,
    )

    logs: list[str] = []

    def reader() -> None:
        assert proc.stdout is not None
        for line in proc.stdout:
            logs.append(line)

    thread = threading.Thread(target=reader, daemon=True)
    thread.start()

    try:
        wait_for_server("127.0.0.1", args.port, proc)
        for path in ["/", "/en/", "/portfolio/", "/?utm_source=baseline&utm_medium=test"]:
            assert_redirect(args.port, path)
        for path in ["/", "/en/", "/portfolio/", "/?utm_source=baseline&utm_medium=test"]:
            assert_apex_unchanged(args.port, path)
    except Exception as exc:
        print(f"www redirect regression failed: {exc}", file=sys.stderr)
        if logs:
            print("--- wrangler pages dev log ---", file=sys.stderr)
            print("".join(logs[-200:]), file=sys.stderr)
        annotation = " | ".join(line.strip() for line in logs[-20:] if line.strip())
        annotation = annotation.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
        print(f"::error title=www redirect regression::{exc}: {annotation}", file=sys.stderr)
        return 1
    finally:
        try:
            os.killpg(proc.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            proc.wait(timeout=10)
        thread.join(timeout=5)

    print("www redirect regression passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
