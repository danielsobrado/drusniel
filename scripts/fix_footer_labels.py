#!/usr/bin/env python3
"""
Fix footer patterns in MDX files to use human-readable labels.
Changes:
- L-001 -> Lore 1
- P-001 -> Prologue 1
- etc.
"""

import re
import os
from pathlib import Path

POSTS_DIR = Path(__file__).parent.parent / "site" / "content" / "posts"

def convert_sequence_to_label(match):
    """Convert L-001 or P-001 to Lore 1 or Prologue 1"""
    prefix = match.group(1)
    number = int(match.group(2))
    
    if prefix == 'L':
        return f"Lore {number}"
    elif prefix == 'P':
        return f"Prologue {number}"
    else:
        # Unknown prefix, return as-is
        return match.group(0)

def fix_footer(content):
    """Fix the footer pattern in content."""
    # Pattern: **[End of L-002 — continues in L-003: Title]**
    # Match the sequence codes L-XXX or P-XXX
    
    def replace_in_footer(m):
        full_match = m.group(0)
        # Replace all L-XXX and P-XXX patterns within this footer
        result = re.sub(r'([LP])-0*(\d+)', convert_sequence_to_label, full_match)
        return result
    
    # Match the entire footer pattern
    pattern = r'\*\*\[End of [LP]-\d+.*?continues in [LP]-\d+.*?\]\*\*'
    return re.sub(pattern, replace_in_footer, content)

def process_file(file_path):
    """Process a single MDX file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = fix_footer(content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    modified_count = 0
    for mdx_file in POSTS_DIR.rglob("*.mdx"):
        if process_file(mdx_file):
            print(f"Fixed: {mdx_file}")
            modified_count += 1
    
    print(f"\nTotal files modified: {modified_count}")

if __name__ == "__main__":
    main()
