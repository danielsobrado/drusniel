import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Fix tags: tags: "['tag1', 'tag2']" -> tags: ['tag1', 'tag2']
    content = re.sub(r'tags: "(\[.*?\])"', r'tags: \1', content)

    # Fix whitespace after frontmatter
    # Split by frontmatter
    parts = content.split('---', 2)
    if len(parts) >= 3:
        body = parts[2]
        # Standardize to ---\n\nBody
        # Check current leading whitespace
        if not body.startswith('\n\n') or body.startswith('\n\n\n'):
             new_body = body.lstrip('\n')
             new_body = '\n\n' + new_body
             content = '---' + parts[1] + '---' + new_body

    if content != original_content:
        print(f"Fixing {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    start_dir = r'c:\Development\workspace\GitHub\drusniel\site\content\posts'
    for root, dirs, files in os.walk(start_dir):
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                fix_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
