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
