#!/usr/bin/env python3
"""Validate generated multilingual 404 pages."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path
from typing import TypedDict


class PageExpectation(TypedDict):
    lang: str
    title: str
    h1: str
    links: set[str]


EXPECTED: dict[str, PageExpectation] = {
    "404.html": {
        "lang": "uk",
        "title": "404 - Сторінку не знайдено | EasyTarget",
        "h1": "Сторінку не знайдено",
        "links": {"/", "/blog/", "/portfolio/"},
    },
    "en/404.html": {
        "lang": "en",
        "title": "404 - Page not found | EasyTarget",
        "h1": "Page not found",
        "links": {"/en/", "/en/blog/", "/en/portfolio/"},
    },
    "ru/404.html": {
        "lang": "ru",
        "title": "404 - Страница не найдена | EasyTarget",
        "h1": "Страница не найдена",
        "links": {"/ru/", "/ru/blog/", "/ru/portfolio/"},
    },
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.lang = ""
        self.title_parts: list[str] = []
        self.h1_parts: list[str] = []
        self.in_title = False
        self.in_h1 = False
        self.robots: list[str] = []
        self.canonicals: list[str] = []
        self.alternates: list[str] = []
        self.json_ld_count = 0
        self.hrefs: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        if tag == "html":
            self.lang = values.get("lang", "")
        elif tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.in_h1 = True
        elif tag == "meta" and values.get("name", "").lower() == "robots":
            self.robots.append(values.get("content", ""))
        elif tag == "link":
            rels = {part.lower() for part in values.get("rel", "").split()}
            href = values.get("href", "")
            if "canonical" in rels:
                self.canonicals.append(href)
            if "alternate" in rels and values.get("hreflang"):
                self.alternates.append(href)
        elif tag == "script" and values.get("type", "").lower() == "application/ld+json":
            self.json_ld_count += 1
        if tag == "a" and values.get("href"):
            self.hrefs.add(values["href"])

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False
        elif tag.lower() == "h1":
            self.in_h1 = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self.in_h1:
            self.h1_parts.append(data)

    @property
    def title(self) -> str:
        return " ".join("".join(self.title_parts).split())

    @property
    def h1(self) -> str:
        return " ".join("".join(self.h1_parts).split())


def validate_page(path: Path, expected: PageExpectation) -> list[str]:
    errors: list[str] = []
    if not path.is_file():
        return [f"missing generated page: {path}"]

    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))

    if parser.lang != expected["lang"]:
        errors.append(f"{path}: lang={parser.lang!r}, expected {expected['lang']!r}")
    if parser.title != expected["title"]:
        errors.append(f"{path}: title={parser.title!r}, expected {expected['title']!r}")
    if parser.h1 != expected["h1"]:
        errors.append(f"{path}: h1={parser.h1!r}, expected {expected['h1']!r}")

    robots_tokens = {
        token.strip().lower()
        for value in parser.robots
        for token in value.split(",")
    }
    if "noindex" not in robots_tokens:
        errors.append(f"{path}: missing meta robots noindex")
    if "follow" not in robots_tokens:
        errors.append(f"{path}: missing meta robots follow")
    if parser.canonicals:
        errors.append(f"{path}: 404 page must not declare canonical {parser.canonicals}")
    if parser.alternates:
        errors.append(f"{path}: 404 page must not declare hreflang alternates {parser.alternates!r}")
    generated_404_links = sorted(
        href
        for href in parser.hrefs
        if href.split("#", 1)[0].split("?", 1)[0].endswith("404.html")
    )
    if generated_404_links:
        errors.append(f"{path}: must not link to generated 404 assets {generated_404_links!r}")
    if parser.json_ld_count:
        errors.append(f"{path}: 404 page must not contain JSON-LD")

    missing_links = set(expected["links"]) - parser.hrefs
    if missing_links:
        errors.append(f"{path}: missing recovery links {sorted(missing_links)}")
    return errors


def main() -> int:
    argument_parser = argparse.ArgumentParser()
    argument_parser.add_argument("--build-dir", default="hugo/public")
    args = argument_parser.parse_args()
    build_dir = Path(args.build_dir)

    errors = [
        error
        for relative_path, expected in EXPECTED.items()
        for error in validate_page(build_dir / relative_path, expected)
    ]
    if errors:
        print("404 page verification failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("404 page verification passed: 3 localized pages are noindex, canonical-free, and navigable")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
