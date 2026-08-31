#!/usr/bin/env python3
"""Regression checks for EasyTarget's generated technical SEO output."""

from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

SITE_ORIGIN = "https://easytarget.com.ua"


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.canonical = ""
        self.alternates: dict[str, str] = {}
        self.noindex = False
        self.icon_urls: list[str] = []
        self.json_ld: list[str] = []
        self._in_json_ld = False
        self._json_chunks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        if tag == "link":
            rel = data.get("rel", "").lower().split()
            if "canonical" in rel:
                self.canonical = data.get("href", "")
            if "alternate" in rel and data.get("hreflang"):
                self.alternates[data["hreflang"]] = data.get("href", "")
            if "icon" in rel or "apple-touch-icon" in rel:
                self.icon_urls.append(data.get("href", ""))
        elif tag == "meta" and data.get("name", "").lower() == "robots":
            self.noindex = "noindex" in data.get("content", "").lower()
        elif tag == "script" and data.get("type", "").lower() == "application/ld+json":
            self._in_json_ld = True
            self._json_chunks = []

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._in_json_ld:
            self.json_ld.append("".join(self._json_chunks))
            self._in_json_ld = False

    def handle_data(self, data: str) -> None:
        if self._in_json_ld:
            self._json_chunks.append(data)


def url_to_output(public: Path, url: str) -> Path | None:
    parsed = urlparse(url)
    if parsed.netloc and parsed.netloc != "easytarget.com.ua":
        return None
    path = parsed.path
    if path.endswith("/"):
        return public / path.lstrip("/") / "index.html"
    candidate = public / path.lstrip("/")
    return candidate if candidate.suffix else candidate / "index.html"


def same_origin_asset_paths(value: object) -> list[str]:
    paths: list[str] = []
    if isinstance(value, dict):
        for item in value.values():
            paths.extend(same_origin_asset_paths(item))
    elif isinstance(value, list):
        for item in value:
            paths.extend(same_origin_asset_paths(item))
    elif isinstance(value, str) and value.startswith(SITE_ORIGIN + "/"):
        parsed = urlparse(value)
        if Path(parsed.path).suffix.lower() in {".svg", ".png", ".jpg", ".jpeg", ".webp"}:
            paths.append(parsed.path)
    return paths


def run(public: Path) -> list[str]:
    errors: list[str] = []
    pages: dict[Path, PageParser] = {}

    for html_file in sorted(public.rglob("*.html")):
        parser = PageParser()
        parser.feed(html_file.read_text(encoding="utf-8", errors="replace"))
        pages[html_file] = parser

        uk_url = parser.alternates.get("uk")
        x_default = parser.alternates.get("x-default")
        if uk_url and x_default != uk_url:
            errors.append(
                f"{html_file.relative_to(public)}: x-default {x_default!r} must match uk alternate {uk_url!r}"
            )

        for icon_url in parser.icon_urls:
            output = url_to_output(public, icon_url)
            if output is not None and not output.is_file():
                errors.append(f"{html_file.relative_to(public)}: missing icon asset {urlparse(icon_url).path}")

        for raw_json in parser.json_ld:
            try:
                payload = json.loads(raw_json)
            except json.JSONDecodeError as exc:
                errors.append(f"{html_file.relative_to(public)}: invalid JSON-LD: {exc}")
                continue
            for asset_path in same_origin_asset_paths(payload):
                if not (public / asset_path.lstrip("/")).is_file():
                    errors.append(f"{html_file.relative_to(public)}: missing JSON-LD asset {asset_path}")

    for language_prefix in ("", "en/", "ru/"):
        stale = public / language_prefix / "40" / "index.html"
        if stale.exists():
            errors.append(f"unexpected generated taxonomy route: {stale.relative_to(public)}")

    sitemap_urls: list[str] = []
    for sitemap in sorted(public.rglob("sitemap.xml")):
        text = sitemap.read_text(encoding="utf-8", errors="replace")
        sitemap_urls.extend(re.findall(r"<loc>([^<]+)</loc>", text))

    for url in sorted(set(sitemap_urls)):
        output = url_to_output(public, url)
        if output is None or output.suffix == ".xml":
            continue
        if not output.is_file():
            errors.append(f"sitemap URL has no generated output: {url}")
            continue
        parser = pages.get(output)
        if parser and parser.noindex:
            errors.append(f"sitemap contains noindex URL: {url}")

    homepage = (public / "index.html").read_text(encoding="utf-8", errors="replace")
    if "<!--email_off-->" not in homepage or "<!--/email_off-->" not in homepage:
        errors.append("homepage email link is not protected from Cloudflare email obfuscation")

    return errors


def main() -> int:
    repo = Path(__file__).resolve().parents[1]
    public = repo / "hugo" / "public"
    if not public.is_dir():
        print("hugo/public is missing; run the production build first", file=sys.stderr)
        return 2
    errors = run(public)
    if errors:
        print(f"SEO invariant check failed with {len(errors)} problem(s):")
        for error in errors:
            print(f"- {error}")
        return 1
    print("SEO invariant check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
