import os
import re
from pathlib import Path

import yaml

# Configuration
REPO_ROOT = Path(__file__).resolve().parents[1]
BASE_DIR = REPO_ROOT / "site" / "content" / "posts"

REQUIRED_FIELDS = [
    'title', 'date', 'tags', 'canon_sequence', 'publication_order', 
    'language', 'type', 'category', 'author'
]

CANON_SEQ_REGEX = r'^[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3}$'

PHASE_TO_TYPE = {
    "lore": "Lore",
    "prequel": "Prequel",
    "prologue": "Prologue",
    "main": "Main",
}


def _as_int(value):
    try:
        return int(str(value).strip())
    except Exception:
        return None


def expected_phase(publication_order, language):
    """
    Classification based on repo rules:
    - EN: lore 1-599, prequel 600-699, prologue 700-799, main 1000+
    - ES: lore 10001-10599, prequel 10600-10699, prologue 10700-10799, main 11000+
    """
    if publication_order is None or not language:
        return None

    lang = str(language).strip().lower()
    order = publication_order

    if lang == "en":
        if 1 <= order <= 599:
            return "lore"
        if 600 <= order <= 699:
            return "prequel"
        if 700 <= order <= 799:
            return "prologue"
        if order >= 1000:
            return "main"
        return None

    if lang == "es":
        if 10001 <= order <= 10599:
            return "lore"
        if 10600 <= order <= 10699:
            return "prequel"
        if 10700 <= order <= 10799:
            return "prologue"
        if order >= 11000:
            return "main"
        return None

    return None

def parse_frontmatter(content):
    match = re.search(r'^---\s*\n(.*?)\n---\s*', content, re.DOTALL)
    if not match:
        return None

    raw = match.group(1)
    try:
        data = yaml.safe_load(raw)
    except Exception:
        return None

    if not isinstance(data, dict):
        return None

    return data

def validate_file(filepath):
    errors = []
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    fm = parse_frontmatter(content)
    if not fm:
        return [f"Could not parse frontmatter in {os.path.basename(filepath)}"]

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in fm:
            errors.append(f"Missing required field: {field}")
        elif not fm[field]:
            errors.append(f"Empty field: {field}")

    # Classification checks (based on publication_order + language)
    po = _as_int(fm.get("publication_order"))
    lang = fm.get("language")
    exp_phase = expected_phase(po, lang)
    if exp_phase:
        got_phase = str(fm.get("canon_phase", "")).strip().lower()
        if got_phase and got_phase != exp_phase:
            errors.append(
                f"canon_phase mismatch: expected {exp_phase} for publication_order={po} language={lang}, got {got_phase}"
            )

        exp_type = PHASE_TO_TYPE.get(exp_phase)
        got_type = str(fm.get("type", "")).strip()
        if exp_type and got_type and got_type.lower() != exp_type.lower():
            errors.append(f"type mismatch: expected {exp_type} for canon_phase={exp_phase}, got {got_type}")

        # storyline validation (optional field in older files)
        storyline = str(fm.get("storyline", "")).strip().lower()
        if storyline:
            if exp_phase in {"lore", "prequel", "prologue"} and storyline != exp_phase:
                errors.append(f"storyline mismatch: expected {exp_phase} for canon_phase={exp_phase}, got {storyline}")
            if exp_phase == "main" and storyline in {"lore", "prequel", "prologue"}:
                errors.append(f"storyline mismatch: expected drusniel|west|east for canon_phase=main, got {storyline}")

    # order vs publication_order is not enforced here yet (repo may still be mid-migration)

    # Check Tags
    tags = fm.get('tags')
    if tags:
        if not isinstance(tags, list):
             errors.append(f"Tags field is not a list: {tags}")
        else:
             for tag in tags:
                 if not tag.startswith('#'):
                     errors.append(f"Tag missing hash: {tag}")
    
    # Check Canon Sequence
    start_seq = fm.get('canon_sequence')
    if start_seq:
        seq_str = str(start_seq).strip().upper()
        if not re.match(CANON_SEQ_REGEX, seq_str):
            errors.append(f"Invalid canon_sequence format: {start_seq}")

    # Check Date format YYYY-MM-DD
    date = fm.get('date')
    if date:
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', str(date)):
             errors.append(f"Invalid date format: {date}")

    # Check Counterparts presence (Warning only if missing)
    if 'counterpart_path' not in fm:
        errors.append("Missing counterpart_path")
    if 'counterpart_title' not in fm:
        errors.append("Missing counterpart_title")

    return errors

def main():
    print("Starting Validation...")
    error_count = 0
    file_count = 0
    
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.mdx') or file.endswith('.md'):
                file_count += 1
                filepath = os.path.join(root, file)
                errs = validate_file(filepath)
                if errs:
                    rel = os.path.relpath(filepath, BASE_DIR)
                    print(f"\n{rel}:")
                    for e in errs:
                        print(f"  - {e}")
                    error_count += 1

    print(f"\nValidation Complete. Scanned {file_count} files. Found issues in {error_count} files.")

if __name__ == '__main__':
    main()
