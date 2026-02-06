import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


MOJIBAKE_MARKERS = (
    "â€”",
    "â€™",
    "â€œ",
    "â€�",
    "â€¦",
    "Ã¡",
    "Ã©",
    "Ã­",
    "Ã³",
    "Ãº",
    "Ã±",
    "Â",
)


@dataclass
class Post:
    path: Path
    fm: dict[str, Any]
    body: str
    raw: str
    newline: str


def read_post(path: Path) -> Post | None:
    raw = path.read_text(encoding="utf-8", newline="")
    newline = "\r\n" if "\r\n" in raw else "\n"
    if not raw.startswith("---"):
        return None

    parts = raw.split("---", 2)
    if len(parts) < 3:
        return None

    fm_raw = parts[1]
    body = parts[2]
    fm = yaml.safe_load(fm_raw) or {}
    if not isinstance(fm, dict):
        return None

    return Post(path=path, fm=fm, body=body, raw=raw, newline=newline)


def dump_post(post: Post) -> str:
    fm_yaml = yaml.safe_dump(post.fm, sort_keys=False, allow_unicode=True).strip()
    return f"---{post.newline}{fm_yaml}{post.newline}---{post.body}"


def looks_mojibake(text: str) -> bool:
    return any(m in text for m in MOJIBAKE_MARKERS)


def fix_mojibake(text: str) -> str:
    if not looks_mojibake(text):
        return text
    try:
        fixed = text.encode("cp1252").decode("utf-8")
    except UnicodeError:
        return text
    if looks_mojibake(fixed):
        return text
    return fixed


def chapter_title_part(title: str) -> str:
    if ":" in title:
        return title.split(":", 1)[1].strip().strip('"')
    return title.strip().strip('"')


def normalize_w008(post: Post, subchapter: int) -> None:
    lang = str(post.fm.get("language", "")).strip().lower()
    title = str(post.fm.get("title", "")).strip()
    part = chapter_title_part(title)

    post.fm["subchapter"] = subchapter
    post.fm["canon_sequence"] = f"W-008-{subchapter:03d}"
    post.fm.setdefault("narrative_weight", "medium")

    if lang == "es":
        heading = f"# Capítulo 8.{subchapter} | {part}"
        heading_re = re.compile(r"^\s*##\s*Cap[íi]tulo\s+8(\.\d+)?\s*\|.*$", re.IGNORECASE | re.MULTILINE)
    else:
        heading = f"# Chapter 8.{subchapter} | {part}"
        heading_re = re.compile(r"^\s*##\s*Chapter\s+8(\.\d+)?\s*\|.*$", re.IGNORECASE | re.MULTILINE)

    body = post.body.lstrip("\r\n")

    # Drop leading horizontal rules before the first heading (common in older posts).
    body = re.sub(r"^(?:\s*---\s*\r?\n)+", "", body)

    if heading_re.search(body):
        body = heading_re.sub(heading, body, count=1)
    else:
        body = f"{heading}{post.newline}{post.newline}{body}"

    # Drop a horizontal rule immediately after the first heading if present.
    body = re.sub(rf"^{re.escape(heading)}\s*\r?\n\s*---\s*\r?\n\s*", f"{heading}{post.newline}{post.newline}", body)
    post.body = post.newline + post.newline + body.lstrip("\r\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Fix mojibake + W-008 metadata for West-side posts.")
    parser.add_argument("--apply", action="store_true", help="Write changes to disk.")
    parser.add_argument(
        "--include-prologues",
        action="store_true",
        help="Also fix West-related prologues (Stonehold + Lumeshire).",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    posts_root = repo_root / "site" / "content" / "posts"
    all_posts = [p for p in posts_root.rglob("index.mdx")]

    selected: list[Post] = []
    for path in all_posts:
        post = read_post(path)
        if not post:
            continue

        if post.fm.get("storyline") == "west":
            selected.append(post)
            continue

        if not args.include_prologues:
            continue

        # West-side prologues that lead into / contextualize the West arc.
        rel = str(path.relative_to(repo_root)).replace("\\", "/")
        if rel in {
            "site/content/posts/en/stonehold/the-call-to-zuraldi/index.mdx",
            "site/content/posts/en/stonehold/a-journey-interrupted/index.mdx",
            "site/content/posts/en/lumeshire/morning-tidings-goblin-threats-at-grukmars-edge/index.mdx",
            "site/content/posts/en/lumeshire/a-captains-counsel-the-quest-for-goblin-tracks-beyond-grukmars-veil/index.mdx",
            "site/content/posts/es/stonehold/la-llamada-a-zuraldi/index.mdx",
            "site/content/posts/es/stonehold/un-viaje-complicado/index.mdx",
            "site/content/posts/es/lumeshire/amenazas-goblin-en-el-borde-de-grukmar/index.mdx",
            "site/content/posts/es/lumeshire/el-consejo-de-un-capitan-la-busqueda-de-goblins-se-extiende-mas-alla-del-borde-de-grukmar/index.mdx",
        }:
            selected.append(post)

    changes = 0
    mojibake_fixed = 0
    w008_fixed = 0

    # Prepare W-008 numbering per language based on publication_order sort.
    w008_by_lang: dict[str, list[Post]] = {}
    for post in selected:
        if str(post.fm.get("canon_sequence", "")).startswith("W-008-"):
            lang = str(post.fm.get("language", "en")).lower().strip()
            w008_by_lang.setdefault(lang, []).append(post)

    for lang, posts in w008_by_lang.items():
        posts.sort(key=lambda p: int(p.fm.get("publication_order", 0) or 0))
        for idx, post in enumerate(posts, start=1):
            before = dump_post(post)
            normalize_w008(post, idx)
            after = dump_post(post)
            if after != before:
                w008_fixed += 1
                changes += 1
                if args.apply:
                    post.path.write_text(after, encoding="utf-8", newline="")

    for post in selected:
        # If we already wrote this file in the W-008 pass, reload the on-disk
        # version for mojibake fixing to avoid reintroducing mixed newlines.
        if str(post.fm.get("canon_sequence", "")).startswith("W-008-"):
            if not args.apply:
                pass
            else:
                post = read_post(post.path) or post

        before = post.raw if not args.apply else post.path.read_text(encoding="utf-8", newline="")
        fixed = fix_mojibake(before)
        if fixed != before:
            mojibake_fixed += 1
            changes += 1
            if args.apply:
                post.path.write_text(fixed, encoding="utf-8", newline="")

    print(f"Selected posts: {len(selected)}")
    print(f"Files changed: {changes} (mojibake fixed: {mojibake_fixed}, W-008 normalized: {w008_fixed})")
    if not args.apply and changes:
        print("Dry-run only. Re-run with --apply to write changes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
