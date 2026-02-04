import csv
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
CONTENT_ROOT = REPO_ROOT / "site" / "content" / "posts"
REPORTS_ROOT = REPO_ROOT / "reports"
RULES_ROOT = REPO_ROOT / "rules"


def _read_text_best_effort(path: Path) -> str:
    raw = path.read_bytes()
    for enc in ("utf-8-sig", "utf-8", "cp1252"):
        try:
            return raw.decode(enc)
        except Exception:
            continue
    return raw.decode("utf-8", errors="replace")


def _line_col_from_index(text: str, idx: int) -> Tuple[int, int]:
    if idx < 0:
        return (1, 1)
    line = text.count("\n", 0, idx) + 1
    last_nl = text.rfind("\n", 0, idx)
    if last_nl == -1:
        col = idx + 1
    else:
        col = idx - last_nl
    return (line, col)


def parse_frontmatter(content: str) -> Tuple[Dict, str]:
    match = re.search(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not match:
        return ({}, content)
    raw = match.group(1)
    try:
        data = yaml.safe_load(raw) or {}
    except Exception:
        data = {}
    body = content[match.end() :]
    if not isinstance(data, dict):
        data = {}
    return (data, body)


@dataclass(frozen=True)
class PostRef:
    lang: str
    order: int
    canon_phase: str
    type: str
    storyline: str
    category: str
    slug: str
    path: Path


def _load_posts_csv(csv_path: Path, lang: str) -> List[PostRef]:
    posts: List[PostRef] = []
    with csv_path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                order = int(row["order"])
            except Exception:
                continue
            category = (row.get("category") or "").strip()
            slug = (row.get("path") or "").strip()
            if not category or not slug:
                continue
            mdx_path = CONTENT_ROOT / lang / category / slug / "index.mdx"
            posts.append(
                PostRef(
                    lang=lang,
                    order=order,
                    canon_phase=(row.get("canon_phase") or "").strip().lower(),
                    type=(row.get("type") or "").strip(),
                    storyline=(row.get("storyline") or "").strip().lower(),
                    category=category,
                    slug=slug,
                    path=mdx_path,
                )
            )
    return posts


def _parse_character_bible(path: Path) -> Dict[str, Dict[str, str]]:
    """
    Extract minimal voice anchors from the character bible:
    - quirk
    - dialogue_style
    """
    text = _read_text_best_effort(path)
    sections = re.split(r"(?m)^##\s+", text)
    out: Dict[str, Dict[str, str]] = {}
    for sec in sections[1:]:
        header, _, rest = sec.partition("\n")
        name = header.strip()
        name = re.split(r"\s+—\s+|\s+--\s+", name, maxsplit=1)[0].strip()
        name = re.sub(r"\s*\(.*?\)\s*$", "", name).strip()
        if not name:
            continue

        def _grab(subheading: str) -> str:
            m = re.search(
                rf"(?ms)^###\s+{re.escape(subheading)}\s*\n(.*?)(?=^###\s+|^##\s+|\Z)",
                rest,
            )
            if not m:
                return ""
            chunk = m.group(1).strip()
            lines = [ln.strip() for ln in chunk.splitlines() if ln.strip()]
            return " ".join(lines)

        quirk = _grab("Quirk")
        dialogue_style = _grab("Dialogue Style")
        if quirk or dialogue_style:
            out[name] = {"quirk": quirk, "dialogue_style": dialogue_style}
    return out


def _compile_prequel_lint_regexes() -> List[Tuple[str, re.Pattern]]:
    rules = [
        ("L001 absolute truth", re.compile(r"\b(in reality|the truth is|it is known that)\b", re.I)),
        ("L002 design intent", re.compile(r"\b(designed to|created to|built to|intended to)\b", re.I)),
        ("L003 determinism", re.compile(r"\b(inevitable|destined|cannot be avoided|must happen)\b", re.I)),
        ("L004 causal certainty", re.compile(r"\b(thus|therefore|as a result|because of this)\b", re.I)),
        ("L010 vocab leak: prison realm", re.compile(r"\bprison realm\b", re.I)),
        ("L010 vocab leak: containment system", re.compile(r"\bcontainment system\b", re.I)),
        ("L010 vocab leak: governance mechanism", re.compile(r"\bgovernance mechanism\b", re.I)),
        ("L010 vocab leak: nexus", re.compile(r"\bNexus\b", re.I)),
    ]
    return rules


def _ending_uncertainty_warning(body: str, lang: str) -> bool:
    text = body.strip()
    if not text:
        return False

    parts = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    last = parts[-1] if parts else ""
    if "?" in last:
        return False

    if lang == "en":
        markers = [
            "unknown",
            "unverified",
            "no one could",
            "missing",
            "burned",
            "disappeared",
            "filed",
            "ignored",
            "could not explain",
        ]
    else:
        markers = [
            "desconoc",
            "no verificado",
            "nadie pudo",
            "falta",
            "quemad",
            "desaparec",
            "archivad",
            "ignorado",
            "no pudo explicar",
        ]
    low = last.lower()
    return not any(m in low for m in markers)


def _omniscient_markers() -> List[Tuple[str, re.Pattern]]:
    return [
        ("omniscient: little did", re.compile(r"\blittle did (he|she|they) know\b", re.I)),
        ("omniscient: would soon", re.compile(r"\bwould soon\b", re.I)),
        ("omniscient: none of them knew", re.compile(r"\bnone of them knew\b", re.I)),
        ("omniscient: unknown to", re.compile(r"\bunknown to (him|her|them)\b", re.I)),
    ]


def _drusniel_tic_checks(body: str, lang: str) -> List[Tuple[str, re.Match]]:
    """
    Drusniel lock: primary grounding tic is stone-tracing (not breath/heartbeat counting).
    This check flags likely "counting" substitution to review.
    """
    patterns = []
    if lang == "en":
        patterns = [
            ("Drusniel tic: heartbeat counting", re.compile(r"\bcount(ed|ing)\b[^.\n]{0,60}\bheartbeats?\b", re.I)),
            ("Drusniel tic: breath counting", re.compile(r"\bcount(ed|ing)\b[^.\n]{0,60}\bbreaths?\b", re.I)),
        ]
    else:
        patterns = [
            ("Drusniel tic: counting heartbeats (es)", re.compile(r"\bcont(ó|aba|ar|ando)\b[^.\n]{0,80}\blatidos?\b", re.I)),
            ("Drusniel tic: counting breaths (es)", re.compile(r"\bcont(ó|aba|ar|ando)\b[^.\n]{0,80}\brespi(raci(ó|o)n|ros?)\b", re.I)),
        ]

    hits: List[Tuple[str, re.Match]] = []
    for label, rx in patterns:
        for m in rx.finditer(body):
            hits.append((label, m))
    return hits


def _stone_tracing_hits(body: str, lang: str) -> List[re.Match]:
    if lang == "en":
        rx = re.compile(
            r"\b(trace|tracing|followed)\b[^.\n]{0,80}\b(veins?|cracks?|fractures?)\b|\b(veins?|cracks?|fractures?)\b[^.\n]{0,80}\b(obsidian|stone|wall|rock)\b",
            re.I,
        )
    else:
        rx = re.compile(
            r"\b(rastre(ar|aba|ó)|seguir|sigui(ó|endo))\b[^.\n]{0,100}\b(vetas?|grietas?|fracturas?)\b|\b(vetas?|grietas?|fracturas?)\b[^.\n]{0,100}\b(obsidiana|piedra|muro|roca)\b",
            re.I,
        )
    return list(rx.finditer(body))


def _extract_dialogue_quotes(body: str, lang: str) -> List[str]:
    if lang == "en":
        # Not perfect for nested quotes; sufficient for consistency stats.
        return [m.group(0)[1:-1] for m in re.finditer(r"\"([^\"]{1,500})\"", body)]
    # Spanish dialogue uses em-dash; capture up to line break.
    quotes: List[str] = []
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("—") or s.startswith("â€”"):
            # normalize typical mojibake em-dash
            cleaned = re.sub(r"^(—|â€”)\s*", "", s)
            cleaned = re.sub(r"\s+$", "", cleaned)
            if cleaned:
                quotes.append(cleaned)
    return quotes


def _extract_attributed_quotes(body: str, speaker: str, lang: str) -> List[str]:
    """
    Best-effort attribution: find quotes likely spoken by `speaker`.
    This is heuristic and designed for flagging obvious voice drift, not correctness.
    """
    if not speaker:
        return []
    name = re.escape(speaker)
    out: List[str] = []

    if lang == "en":
        speech_verbs = r"(said|asked|whispered|murmured|snapped|shouted|replied|answered|called|growled|hissed|said quietly|said softly)"

        # "..." Zaelar ...
        for m in re.finditer(rf"\"([^\"]{{1,500}})\"\s*[,—-]?\s*\b{name}\b", body):
            out.append(m.group(1))

        # Zaelar said ... "..."
        for m in re.finditer(rf"\b{name}\b[^.\n]{{0,60}}\b{speech_verbs}\b[^\"\n]{{0,40}}\"([^\"]{{1,500}})\"", body, re.I):
            out.append(m.group(2))

        # "..." ... said Zaelar
        for m in re.finditer(rf"\"([^\"]{{1,500}})\"[^.\n]{{0,60}}\b{speech_verbs}\b[^.\n]{{0,30}}\b{name}\b", body, re.I):
            out.append(m.group(1))

        return out

    # Spanish: match lines with dialogue where attribution is inline (—... —dijo Zaelar—)
    for m in re.finditer(
        rf"(?m)^(?:—|â€”)\s*(.+?)\s*(?:—|â€”)\s*(?:dijo|preguntó|susurró|gruñó|exigió|respondió)\s+{name}\b",
        body,
    ):
        out.append(m.group(1))
    return out


def _word_count(s: str) -> int:
    return len(re.findall(r"\b[\w']+\b", s))


def _qualifier_rate(quotes: Iterable[str], lang: str) -> float:
    text = " ".join(quotes).lower()
    if not text.strip():
        return 0.0
    if lang == "en":
        quals = ["perhaps", "maybe", "i think", "i suppose", "kind of", "sort of"]
    else:
        quals = ["quizá", "quizas", "tal vez", "creo", "supongo", "algo así", "más o menos"]
    hits = sum(text.count(q) for q in quals)
    words = max(1, _word_count(text))
    return hits / words


def _zaelar_voice_lints(quotes: Iterable[str]) -> List[str]:
    """
    From `rules/CHARACTERS/ZAELAR_and_SZORAVEL.md`:
    - Zaelar must not sound procedural (Szoravel-ish)
    - Zaelar must never promise return (only imply possibility)
    """
    issues: List[str] = []
    all_text = " ".join(quotes).lower()
    if not all_text.strip():
        return issues

    procedural_markers = [
        "sufficient",
        "procedure",
        "protocol",
        "component",
        "again.",
        "that is sufficient",
        "you'll do",
    ]
    if any(p in all_text for p in procedural_markers):
        issues.append("Zaelar dialogue contains procedural/handler markers (risk of Szoravel voice bleed).")

    # Promise-return check: flag strong guarantees without conditional language.
    for q in quotes:
        low = q.lower()
        if any(w in low for w in ("return", "come back", "bring you out", "get you out")):
            if ("will" in low or "you'll" in low) and not any(w in low for w in ("might", "may", "if", "depends")):
                issues.append("Zaelar dialogue may be guaranteeing return (should only imply possibility).")
                break

    return issues


def _szoravel_voice_lints(quotes: Iterable[str]) -> List[str]:
    """
    From `rules/CHARACTERS/ZAELAR_and_SZORAVEL.md`:
    - Szoravel must not encourage/validate/sympathize.
    """
    issues: List[str] = []
    all_text = " ".join(quotes).lower()
    if not all_text.strip():
        return issues

    forbidden = [
        "i understand",
        "i'm sorry",
        "well done",
        "good job",
        "proud",
        "you can do it",
        "i believe in you",
    ]
    if any(p in all_text for p in forbidden):
        issues.append("Szoravel dialogue contains encouragement/validation markers (forbidden).")
    return issues


def main() -> int:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    char_bible_path = RULES_ROOT / "CHARACTERS" / "characters_complete.md"
    tics_path = RULES_ROOT / "CHARACTERS" / "DRUSNIEL_BEHAVIORAL_TICS.md"
    zs_path = RULES_ROOT / "CHARACTERS" / "ZAELAR_and_SZORAVEL.md"
    guidelines_path = RULES_ROOT / "GUIDELINES.md"

    voices = _parse_character_bible(char_bible_path) if char_bible_path.exists() else {}
    drusniel_tics_text = _read_text_best_effort(tics_path) if tics_path.exists() else ""
    _ = _read_text_best_effort(zs_path) if zs_path.exists() else ""
    _ = _read_text_best_effort(guidelines_path) if guidelines_path.exists() else ""

    en_posts = _load_posts_csv(REPORTS_ROOT / "en_posts.csv", "en")
    es_posts = _load_posts_csv(REPORTS_ROOT / "es_posts.csv", "es")
    all_posts = en_posts + es_posts

    prequel_rules = _compile_prequel_lint_regexes()
    omni_rules = _omniscient_markers()

    findings: List[Dict] = []
    per_pov: Dict[Tuple[str, str], Dict] = {}
    per_speaker: Dict[Tuple[str, str], List[str]] = {}

    for post in all_posts:
        if not post.path.exists():
            findings.append(
                {
                    "severity": "error",
                    "post": post,
                    "kind": "missing-file",
                    "msg": f"Missing file for {post.lang} posts.csv entry: {post.path}",
                    "line": 1,
                    "col": 1,
                    "excerpt": "",
                }
            )
            continue

        content = _read_text_best_effort(post.path)
        fm, body = parse_frontmatter(content)

        author = str(fm.get("author") or "").strip()
        canon_phase = str(fm.get("canon_phase") or post.canon_phase or "").strip().lower()
        post_type = str(fm.get("type") or post.type or "").strip()

        pov_key = (post.lang, author or "<missing-author>")
        per = per_pov.setdefault(
            pov_key,
            {
                "posts": [],
                "dialogue_words": [],
                "qual_rate": [],
                "stone_tracing_counts": [],
            },
        )
        per["posts"].append(post)

        quotes = _extract_dialogue_quotes(body, post.lang)
        if quotes:
            per["dialogue_words"].extend([_word_count(q) for q in quotes])
            per["qual_rate"].append(_qualifier_rate(quotes, post.lang))

        # Targeted speaker attribution for voice rules that are strict and high impact.
        # Zaelar has strict voice constraints that we can lint across dialogue.
        sq = _extract_attributed_quotes(body, "Zaelar", post.lang)
        if sq:
            per_speaker.setdefault((post.lang, "Zaelar"), []).extend(sq)

        if author.lower() == "drusniel":
            per["stone_tracing_counts"].append(len(_stone_tracing_hits(body, post.lang)))
            for label, m in _drusniel_tic_checks(body, post.lang):
                line, col = _line_col_from_index(body, m.start())
                excerpt = body[m.start() : m.end()].replace("\n", " ").strip()
                findings.append(
                    {
                        "severity": "high",
                        "post": post,
                        "kind": "drusniel-tic",
                        "msg": f"{label} (review vs `rules/CHARACTERS/DRUSNIEL_BEHAVIORAL_TICS.md`)",
                        "line": line,
                        "col": col,
                        "excerpt": excerpt[:160],
                    }
                )

        if canon_phase in {"lore", "prequel"}:
            for rule_name, rx in prequel_rules:
                for m in rx.finditer(body):
                    line, col = _line_col_from_index(body, m.start())
                    excerpt = body[m.start() : m.end()].replace("\n", " ").strip()
                    findings.append(
                        {
                            "severity": "high" if rule_name.startswith(("L001", "L002", "L003", "L004", "L010")) else "med",
                            "post": post,
                            "kind": "prequel-lint",
                            "msg": rule_name,
                            "line": line,
                            "col": col,
                            "excerpt": excerpt[:160],
                        }
                    )
            if _ending_uncertainty_warning(body, post.lang):
                findings.append(
                    {
                        "severity": "med",
                        "post": post,
                        "kind": "ending",
                        "msg": "Lore/Prequel ending may be too clean (no uncertainty marker detected in final paragraph).",
                        "line": max(1, body.count("\n") - 3),
                        "col": 1,
                        "excerpt": "",
                    }
                )

        if canon_phase in {"main", "prologue"}:
            for rule_name, rx in omni_rules:
                for m in rx.finditer(body):
                    line, col = _line_col_from_index(body, m.start())
                    excerpt = body[m.start() : m.end()].replace("\n", " ").strip()
                    findings.append(
                        {
                            "severity": "med",
                            "post": post,
                            "kind": "omniscient",
                            "msg": rule_name,
                            "line": line,
                            "col": col,
                            "excerpt": excerpt[:160],
                        }
                    )

    # Speaker-level lints (aggregate across posts)
    for (lang, speaker), quotes in per_speaker.items():
        if speaker != "Zaelar":
            continue
        for issue in _zaelar_voice_lints(quotes):
            findings.append(
                {
                    "severity": "med",
                    "post": PostRef(
                        lang=lang,
                        order=-1,
                        canon_phase="",
                        type="",
                        storyline="",
                        category="",
                        slug="",
                        path=RULES_ROOT / "CHARACTERS" / "ZAELAR_and_SZORAVEL.md",
                    ),
                    "kind": "voice",
                    "msg": issue,
                    "line": 1,
                    "col": 1,
                    "excerpt": "",
                }
            )

    # Build report
    out_path = REPORTS_ROOT / "voice_consistency_report.md"
    out_lines: List[str] = []
    out_lines.append(f"# Voice Consistency Report")
    out_lines.append("")
    out_lines.append(f"- Generated: {ts}")
    out_lines.append(f"- Scanned: {len(all_posts)} posts (`reports/en_posts.csv` + `reports/es_posts.csv`)")
    out_lines.append(f"- Rules used: `rules/GUIDELINES.md`, `rules/CHARACTERS/characters_complete.md`, `rules/CHARACTERS/DRUSNIEL_BEHAVIORAL_TICS.md`, `rules/CHARACTERS/ZAELAR_and_SZORAVEL.md`")
    out_lines.append("")

    # High-signal summary
    highs = [f for f in findings if f["severity"] == "high"]
    meds = [f for f in findings if f["severity"] == "med"]
    errs = [f for f in findings if f["severity"] == "error"]

    out_lines.append("## Summary")
    out_lines.append("")
    out_lines.append(f"- High severity: {len(highs)}")
    out_lines.append(f"- Medium severity: {len(meds)}")
    out_lines.append(f"- Errors: {len(errs)}")
    out_lines.append("")

    def _fmt_ref(f: Dict) -> str:
        post: PostRef = f["post"]
        rel = post.path.relative_to(REPO_ROOT)
        return f"`{rel}:{f['line']}`"

    def _emit_findings(title: str, items: List[Dict], limit: int = 80) -> None:
        out_lines.append(f"## {title}")
        out_lines.append("")
        if not items:
            out_lines.append("- None.")
            out_lines.append("")
            return
        for f in items[:limit]:
            post: PostRef = f["post"]
            out_lines.append(
                f"- {_fmt_ref(f)} — {f['msg']} (`{post.lang}` / `{post.canon_phase}` / `{post.slug}`){' — ' + f['excerpt'] if f['excerpt'] else ''}"
            )
        if len(items) > limit:
            out_lines.append(f"- …and {len(items) - limit} more.")
        out_lines.append("")

    _emit_findings("High Severity Findings", highs, limit=120)
    _emit_findings("Medium Severity Findings", meds, limit=120)
    _emit_findings("Errors", errs, limit=120)

    out_lines.append("## Speaker Quote Stats (attributed, heuristic)")
    out_lines.append("")
    if not per_speaker:
        out_lines.append("- No attributed speaker quotes found.")
        out_lines.append("")
    else:
        for (lang, speaker), quotes in sorted(per_speaker.items(), key=lambda x: (x[0][0], x[0][1].lower())):
            wc = [_word_count(q) for q in quotes]
            out_lines.append(
                f"- **{speaker}** (`{lang}`) — quotes: {len(quotes)}, avg words: {(sum(wc)/len(wc)) if wc else 0.0:.1f}, qualifier rate: {_qualifier_rate(quotes, lang):.4f}"
            )
        out_lines.append("")

    out_lines.append("## POV Voice Anchors (from character sheets)")
    out_lines.append("")
    if not voices:
        out_lines.append("- Could not parse `rules/CHARACTERS/characters_complete.md`.")
        out_lines.append("")
    else:
        names = sorted(voices.keys())
        for name in names:
            dialogue_style = voices[name].get("dialogue_style", "").strip()
            quirk = voices[name].get("quirk", "").strip()
            if not dialogue_style and not quirk:
                continue
            out_lines.append(f"- **{name}**")
            if dialogue_style:
                out_lines.append(f"  - Dialogue style: {dialogue_style[:240]}")
            if quirk:
                out_lines.append(f"  - Quirk: {quirk[:240]}")
        out_lines.append("")

    out_lines.append("## Per-POV Stats (heuristic)")
    out_lines.append("")
    for (lang, pov), data in sorted(per_pov.items(), key=lambda x: (x[0][0], x[0][1].lower())):
        posts_count = len(data["posts"])
        dw = data["dialogue_words"]
        avg_words = (sum(dw) / len(dw)) if dw else 0.0
        qual = (sum(data["qual_rate"]) / len(data["qual_rate"])) if data["qual_rate"] else 0.0
        out_lines.append(f"- **{pov}** (`{lang}`) — posts: {posts_count}, avg dialogue words: {avg_words:.1f}, qualifier rate: {qual:.4f}")
        if pov.lower() == "drusniel":
            st = data["stone_tracing_counts"]
            if st:
                out_lines.append(f"  - Stone-tracing hits per post (count): min={min(st)}, max={max(st)}, avg={(sum(st)/len(st)):.2f}")
                if drusniel_tics_text:
                    out_lines.append("  - Drusniel tic lock reference: `rules/CHARACTERS/DRUSNIEL_BEHAVIORAL_TICS.md`")
    out_lines.append("")

    out_path.write_text("\n".join(out_lines) + "\n", encoding="utf-8")
    print(f"Wrote {out_path}")
    print(f"High={len(highs)} Med={len(meds)} Errors={len(errs)}")
    return 0 if not errs else 1


if __name__ == "__main__":
    raise SystemExit(main())
