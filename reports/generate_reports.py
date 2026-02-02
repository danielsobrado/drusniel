import os
import csv
import re
from datetime import datetime

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
CONTENT_ROOT = os.path.join(PROJECT_ROOT, "site", "content", "posts")

def parse_frontmatter(file_path):
    """Extracts frontmatter from an MDX file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract YAML frontmatter block
    match = re.search(r'^---\s+(.*?)\s+---', content, re.DOTALL)
    if not match:
        return {}
    
    frontmatter = match.group(1)
    data = {}
    
    # Simple regex parsing for key-value pairs (handling basic strings and booleans)
    # This avoids external dependencies like PyYAML
    for line in frontmatter.split('\n'):
        line = line.strip()
        if ':' in line and not line.startswith('#'):
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            
            # Remove quotes if present
            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]
            
            data[key] = value
            
    return data

def scan_directory(lang_code):
    """Scans the content directory for a specific language."""
    posts_dir = os.path.join(CONTENT_ROOT, lang_code)
    posts = []
    
    if not os.path.exists(posts_dir):
        print(f"Warning: Directory not found: {posts_dir}")
        return posts

    for root, dirs, files in os.walk(posts_dir):
        if "index.mdx" in files:
            file_path = os.path.join(root, "index.mdx")
            data = parse_frontmatter(file_path)
            
            # Skip if no publication_order (likely draft or utility file)
            if 'publication_order' not in data:
                continue
                
            # Determine type from canon_phase
            canon_phase = data.get('canon_phase', '')
            post_type = ''
            if canon_phase == 'lore': post_type = 'Lore'
            elif canon_phase == 'prequel': post_type = 'Prequel'
            elif canon_phase == 'prologue': post_type = 'Prologue'
            elif canon_phase == 'east': post_type = 'Prologue'
            elif canon_phase == 'main': post_type = 'Main'
            elif canon_phase == 'meta': 
                # Skip meta posts as requested
                continue
            
            # Get category from parent folder name
            # Structure: .../posts/en/{category}/{slug}/index.mdx
            path_parts = os.path.normpath(root).split(os.sep)
            category = path_parts[-2] if len(path_parts) >= 2 else ""
            slug = path_parts[-1]

            post = {
                'order': int(data.get('publication_order', 0)),
                'date': data.get('date', ''),
                'title': data.get('title', ''),
                'category': category,
                'type': post_type,
                'canon_phase': canon_phase,
                'canon_sequence': data.get('canon_sequence', ''),
                'featured': data.get('featured', 'false'),
                'path': slug
            }
            
            # Filter out potentially invalid large order numbers (if any legacy ones remain > 2000)
            if post['order'] < 2000:
                posts.append(post)
    
    # Sort by order
    posts.sort(key=lambda x: x['order'])
    return posts

def generate_csv(lang_code, filename):
    """Generates a CSV report for the given language."""
    print(f"Scanning {lang_code} content...")
    posts = scan_directory(lang_code)
    
    output_path = os.path.join(BASE_DIR, filename)
    print(f"Writing {len(posts)} rows to {filename}...")
    
    fieldnames = ['order', 'date', 'title', 'category', 'type', 'canon_phase', 'canon_sequence', 'featured', 'path']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for post in posts:
            writer.writerow(post)
            
    print(f"Successfully generated {output_path}")

if __name__ == "__main__":
    generate_csv('en', 'en_posts.csv')
    generate_csv('es', 'es_posts.csv')
    print("Done.")
