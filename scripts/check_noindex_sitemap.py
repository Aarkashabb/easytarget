#!/usr/bin/env python3
"""Fail if any URL that renders with noindex is present in any generated language sitemap.

This test works against either a local Hugo build directory or a live base URL.
- Local mode (default): inspect HTML files from --build-dir and read sitemap XML from disk.
- Live mode: fetch sitemap XML and pages from --base-url and validate X-Robots-Tag + meta robots.
"""

from __future__ import annotations

import argparse
import json
import re
import ssl
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit, urlunsplit

CANONICAL_HOST = "easytarget.com.ua"
WWW_HOST = "www.easytarget.com.ua"
DEFAULT_BUILD_DIR = Path("hugo/public")
SSL_CONTEXT = ssl._create_unverified_context()


class RobotsParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.meta_robots: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "meta":
            return
        data = {k.lower(): (v or "") for k, v in attrs}
        if data.get("name", "").lower() == "robots":
            self.meta_robots.append(data.get("content", ""))


@dataclass(frozen=True)
class PageProbe:
    url: str
    status: int
    final_url: str
    headers: dict[str, str]
    body: str


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, hdrs, newurl):  # type: ignore[override]
        return None


def fetch(url: str, allow_redirects: bool = True) -> PageProbe:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}, method="GET")
    handlers: list[urllib.request.BaseHandler] = [urllib.request.HTTPSHandler(context=SSL_CONTEXT)]
    if not allow_redirects:
        handlers.insert(0, NoRedirect())
    opener = urllib.request.build_opener(*handlers)
    try:
        with opener.open(req, timeout=20) as resp:
            return PageProbe(
                url=url,
                status=resp.status,
                final_url=resp.geturl(),
                headers={k.lower(): v for k, v in resp.headers.items()},
                body=resp.read().decode("utf-8", errors="replace"),
            )
    except urllib.error.HTTPError as e:
        return PageProbe(
            url=url,
            status=e.code,
            final_url=getattr(e, "url", url),
            headers={k.lower(): v for k, v in e.headers.items()},
            body=e.read().decode("utf-8", errors="replace"),
        )


def parse_locs(xml_text: str) -> list[str]:
    root = ET.fromstring(xml_text)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [e.text.strip() for e in root.findall(".//sm:loc", ns) if e.text and e.text.strip()]


def decode_path(url: str) -> str:
    return unquote(urlsplit(url).path)


def local_path_for_url(build_dir: Path, url: str) -> Path:
    path = decode_path(url)
    if path == "/":
        return build_dir / "index.html"
    return build_dir / path.lstrip("/") / "index.html" if path.endswith("/") else build_dir / path.lstrip("/")


def html_noindex(html: str) -> list[str]:
    parser = RobotsParser()
    parser.feed(html)
    return [x for x in parser.meta_robots if "noindex" in x.lower()]


def inspect_local(build_dir: Path, url: str) -> dict[str, object]:
    path = local_path_for_url(build_dir, url)
    if path.is_dir():
        path = path / "index.html"
    if not path.exists():
        raise FileNotFoundError(f"Missing file for sitemap URL {url}: {path}")
    html = path.read_text(encoding="utf-8", errors="replace")
    robots = html_noindex(html)
    return {
        "file": str(path),
        "noindex": bool(robots),
        "reasons": [f"meta robots: {r}" for r in robots],
        "x_robots_tag": "",
    }


def inspect_live(base_url: str, url: str) -> dict[str, object]:
    probe = fetch(url)
    robots = html_noindex(probe.body)
    xrt = probe.headers.get("x-robots-tag", "")
    reasons = []
    if "noindex" in xrt.lower():
        reasons.append(f"X-Robots-Tag: {xrt}")
    reasons.extend([f"meta robots: {r}" for r in robots])
    return {
        "file": probe.final_url,
        "noindex": bool(reasons),
        "reasons": reasons,
        "x_robots_tag": xrt,
        "status": probe.status,
    }


def to_live_url(base_url: str, canonical_url: str) -> str:
    base = urlsplit(base_url)
    target = urlsplit(canonical_url)
    return urlunsplit((base.scheme, base.netloc, target.path, target.query, target.fragment))


def read_xml(build_dir: Path, url_or_path: str, live: bool, base_url: str | None) -> str:
    if live:
        probe = fetch(url_or_path)
        if probe.status >= 400:
            raise RuntimeError(f"Failed to fetch {url_or_path}: {probe.status}")
        return probe.body
    path = build_dir / url_or_path.lstrip("/")
    if not path.exists():
        raise FileNotFoundError(f"Missing sitemap file: {path}")
    return path.read_text(encoding="utf-8", errors="replace")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-dir", default=str(DEFAULT_BUILD_DIR), help="Local Hugo build directory")
    parser.add_argument("--base-url", default="", help="Live base URL, e.g. https://easytarget.pages.dev")
    args = parser.parse_args()

    build_dir = Path(args.build_dir)
    live_mode = bool(args.base_url)
    base_url = args.base_url.rstrip("/") if args.base_url else ""

    if live_mode:
        root_sitemap_url = f"{base_url}/sitemap.xml"
        root_xml = fetch(root_sitemap_url)
        if root_xml.status >= 400:
            print(f"Could not fetch sitemap index: {root_xml.status}", file=sys.stderr)
            return 2
        sitemap_locs = parse_locs(root_xml.body)
    else:
        sitemap_locs = parse_locs((build_dir / "sitemap.xml").read_text(encoding="utf-8", errors="replace"))

    if len(sitemap_locs) != 3:
        print(f"Expected 3 language sitemaps, found {len(sitemap_locs)}: {sitemap_locs}", file=sys.stderr)
        return 1

    all_urls: list[str] = []
    per_sitemap: dict[str, list[str]] = {}
    for sitemap_url in sitemap_locs:
        if live_mode:
            live_sitemap_url = to_live_url(base_url, sitemap_url)
            xml = fetch(live_sitemap_url)
            if xml.status >= 400:
                print(f"Could not fetch sitemap {live_sitemap_url}: {xml.status}", file=sys.stderr)
                return 2
            locs = parse_locs(xml.body)
        else:
            sitemap_path = build_dir / decode_path(sitemap_url).lstrip("/")
            if not sitemap_path.exists():
                print(f"Missing sitemap file: {sitemap_path}", file=sys.stderr)
                return 2
            locs = parse_locs(sitemap_path.read_text(encoding="utf-8", errors="replace"))
        per_sitemap[sitemap_url] = locs
        all_urls.extend(locs)

    all_urls = sorted(set(all_urls))
    noindex_urls: list[str] = []
    details: dict[str, dict[str, object]] = {}
    for canonical_url in all_urls:
        if live_mode:
            live_url = to_live_url(base_url, canonical_url)
            details[canonical_url] = inspect_live(base_url, live_url)
        else:
            details[canonical_url] = inspect_local(build_dir, canonical_url)
        if details[canonical_url]["noindex"]:
            noindex_urls.append(canonical_url)

    if noindex_urls:
        payload = {
            "sitemap_count": len(sitemap_locs),
            "url_count": len(all_urls),
            "noindex_count": len(noindex_urls),
            "noindex_urls": noindex_urls,
            "by_sitemap": {k: len(v) for k, v in per_sitemap.items()},
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        print("Noindex URLs still present in generated sitemap.", file=sys.stderr)
        return 1

    payload = {
        "sitemap_count": len(sitemap_locs),
        "url_count": len(all_urls),
        "noindex_count": 0,
        "by_sitemap": {k: len(v) for k, v in per_sitemap.items()},
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
