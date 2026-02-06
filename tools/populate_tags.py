import re
from dataclasses import dataclass
from pathlib import Path

import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = REPO_ROOT / "site" / "content" / "posts"


WEST_CHAPTER_TO_POV = {
    8: "dulint",
    10: "dulint",
    12: "maris",
    14: "dulint",
    16: "dulint",
    18: "dulint",
    20: "maris",
    22: "dulint",
}


CATEGORY_TO_REGION_TAG = {
    "astalor": "#astalor",
    "wyrmreach": "#wyrmreach",
    "umbrakor": "#umbrakor",
    "stonehold": "#stonehold",
    "lumeshire": "#lumeshire",
    "grukmar": "#grukmar",
    "contian": "#contian",
    "elenoria": "#elenoria",
    "frostgard": "#frostgard",
}


FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*", re.DOTALL)


def _normalize_category_key(value: str) -> str:
    value = str(value or "").strip().lower()
    value = value.replace("’", "'")
    return re.sub(r"[^a-z0-9]+", "", value)


def _normalize_tag_text(value: str) -> str:
    value = str(value or "").strip().lower()
    value = value.replace("’", "'")
    value = value.replace("—", " ").replace("–", " ")
    value = re.sub(r"['\"]+", "", value)
    value = re.sub(r"[_/\\-]+", " ", value)
    value = re.sub(r"[.,;!?()[\]{}]+", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def _arc_tag_from_title(title: str) -> str:
    title = str(title or "").strip()
    if ":" in title:
        title = title.split(":", 1)[0]
    return f"#{_normalize_tag_text(title)}"


def _pov_tag(frontmatter: dict) -> str:
    storyline = str(frontmatter.get("storyline", "")).strip().lower()
    category = str(frontmatter.get("category", "")).strip()

    if storyline == "drusniel":
        return "#drusniel"
    if storyline == "west":
        chapter_raw = frontmatter.get("chapter")
        try:
            chapter = int(str(chapter_raw).strip())
        except Exception:
            raise ValueError(f"Invalid chapter for west storyline: {chapter_raw!r}")
        pov = WEST_CHAPTER_TO_POV.get(chapter)
        if not pov:
            raise ValueError(f"Missing west POV mapping for chapter {chapter}")
        return f"#{pov}"
    if storyline == "lore":
        return "#lore"
    if storyline == "prologue":
        return f"#{_normalize_category_key(category)}"

    raise ValueError(f"Unsupported storyline for POV tag: {storyline!r}")


def _region_tag_from_category(category: str) -> str:
    key = _normalize_category_key(category)
    tag = CATEGORY_TO_REGION_TAG.get(key)
    if tag:
        return tag
    return f"#{_normalize_tag_text(category)}"


@dataclass(frozen=True)
class TagResult:
    arc: str
    pov: str
    region: str

    def as_yaml_inline_list(self) -> str:
        return f"['{self.arc}', '{self.pov}', '{self.region}']"


def _parse_frontmatter_dict(frontmatter_text: str) -> dict:
    data = yaml.safe_load(frontmatter_text)
    if not isinstance(data, dict):
        raise ValueError("Frontmatter YAML is not a mapping")
    return data


def _compute_tags(frontmatter: dict) -> TagResult:
    title = frontmatter.get("title", "")
    category = frontmatter.get("category", "")

    arc = _arc_tag_from_title(title)
    pov = _pov_tag(frontmatter)
    region = _region_tag_from_category(category)
    return TagResult(arc=arc, pov=pov, region=region)


def populate_tags_in_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.search(content)
    if not match:
        raise ValueError("Could not find frontmatter block")

    raw_fm = match.group(1)
    fm = _parse_frontmatter_dict(raw_fm)

    tags = _compute_tags(fm)
    replacement_line = f"tags: {tags.as_yaml_inline_list()}"

    fm_with_updated_tags, subs = re.subn(
        r"(?m)^tags:.*$",
        replacement_line,
        raw_fm,
        count=1,
    )
    if subs != 1:
        raise ValueError(f"Expected to replace exactly one tags line, replaced {subs}")

    if fm_with_updated_tags == raw_fm:
        return False

    new_content = content[: match.start(1)] + fm_with_updated_tags + content[match.end(1) :]
    path.write_text(new_content, encoding="utf-8")
    return True


def main() -> int:
    targets = []
    for lang in ("en", "es"):
        root = POSTS_DIR / lang
        targets.extend(root.rglob("index.mdx"))

    changed = 0
    failed = []

    for path in sorted(targets):
        try:
            if populate_tags_in_file(path):
                changed += 1
        except Exception as exc:
            failed.append((path, str(exc)))

    print(f"Scanned {len(targets)} files. Updated {changed} files.")
    if failed:
        print(f"\nFailures ({len(failed)}):")
        for path, msg in failed:
            rel = path.relative_to(REPO_ROOT)
            print(f"- {rel}: {msg}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
