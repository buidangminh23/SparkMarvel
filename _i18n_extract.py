"""Trich xuat moi chuoi hien thi tu cac trang HTML de dich i18n. Tam thoi, se xoa sau."""
from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(r"L:\SparkMarvel")
SKIP_TAGS = {"script", "style", "noscript", "svg", "path", "rect", "circle"}
ATTR_KEYS = {"alt", "placeholder", "aria-label", "title", "value"}
HAS_LETTER = re.compile(r"[A-Za-zÀ-ỹ]")


class Extractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.strings: set[str] = set()
        self._meta_pending = False

    def handle_starttag(self, tag, attrs):
        self.stack.append(tag)
        d = dict(attrs)
        for k in ATTR_KEYS:
            v = d.get(k)
            if v and HAS_LETTER.search(v):
                self.strings.add(v.strip())
        if tag == "meta":
            name = d.get("name") or d.get("property") or ""
            if name in ("description", "og:title", "og:description"):
                c = d.get("content")
                if c and HAS_LETTER.search(c):
                    self.strings.add(c.strip())
        if tag in ("img",):
            self.stack.pop()  # img is void

    def handle_startendtag(self, tag, attrs):
        d = dict(attrs)
        for k in ATTR_KEYS:
            v = d.get(k)
            if v and HAS_LETTER.search(v):
                self.strings.add(v.strip())
        if tag == "meta":
            name = d.get("name") or d.get("property") or ""
            if name in ("description", "og:title", "og:description"):
                c = d.get("content")
                if c and HAS_LETTER.search(c):
                    self.strings.add(c.strip())

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        elif tag in self.stack:
            while self.stack and self.stack.pop() != tag:
                pass

    def handle_data(self, data):
        if any(t in SKIP_TAGS for t in self.stack):
            return
        text = data.strip()
        if text and HAS_LETTER.search(text):
            self.strings.add(text)


all_strings: set[str] = set()
for html in sorted(ROOT.glob("*.html")):
    p = Extractor()
    p.feed(html.read_text(encoding="utf-8"))
    all_strings |= p.strings

cleaned = sorted(s for s in all_strings if len(s) <= 400)
out = ROOT / "_i18n_strings.json"
out.write_text(json.dumps(cleaned, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"Unique strings: {len(cleaned)}")
print(f"Total chars: {sum(len(s) for s in cleaned)}")
