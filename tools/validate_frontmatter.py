import os
import re
import yaml

# Configuration
BASE_DIR = r'c:\Development\workspace\GitHub\drusniel\site\content\posts'

REQUIRED_FIELDS = [
    'title', 'date', 'tags', 'canon_sequence', 'publication_order', 
    'language', 'type', 'category', 'author'
]

CANON_SEQ_REGEX = r'^(L|P|R|M|UMB-M|LUM-M|AST-L|WYR-L)-\d{3}$'
# Note: User has UMB-M-xxx in examples, need to support that. 
# CLAUDE.md says L-001, but file UMB-M-001 exists. I should allow the longer format.
# Updating regex to be more permissive based on seen files: ^[A-Z]+-(L|P|R|M)-\d{3}$ maybe?
# Let's inspect known values: LUM-M-002, UMB-M-001, AST-L-001. 
# Pattern seems to be: [REGION_CODE]-[TYPE]-[NUMBER]
# Or just accept strict known formats if I can derive them. 
# Let's use a broader regex for now: ^[A-Z]+-[A-Z]+-\d{3}$

CANON_SEQ_REGEX_BROAD = r'^[A-Z0-9]+-[A-Z]+-\d{3}$'

def parse_frontmatter(content):
    try:
        match = re.search(r'^---\s+(.*?)\s+---', content, re.DOTALL)
        if match:
            # Simple YAML parser or PyYAML if available. 
            # Since we can't rely on pip packages in this env easily, let's try manual or simple parsing
            # But the user environment might have pyyaml. I'll try to use naive parsing if import fails, 
            # but standard generic parsing is safer.
            # I'll stick to basic line splitting for robustness if pyyaml isn't there.
            fm = {}
            for line in match.group(1).split('\n'):
                if ':' in line:
                    key, val = line.split(':', 1)
                    key = key.strip()
                    val = val.strip()
                    # Handle lists like ['a', 'b']
                    if val.startswith('[') and val.endswith(']'):
                         # primitive list parse
                         val = eval(val) 
                    else:
                        # Strip quotes
                        val = val.strip("'").strip('"')
                    fm[key] = val
            return fm
    except Exception as e:
        return None
    return None

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
        if not re.match(CANON_SEQ_REGEX_BROAD, start_seq):
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
                    print(f"\n{file}:")
                    for e in errs:
                        print(f"  - {e}")
                    error_count += 1

    print(f"\nValidation Complete. Scanned {file_count} files. Found issues in {error_count} files.")

if __name__ == '__main__':
    main()
