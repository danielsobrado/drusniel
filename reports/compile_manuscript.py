import os
import csv
import re

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
CONTENT_ROOT = os.path.join(PROJECT_ROOT, "site", "content", "posts")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "dist", "manuscripts")

# Regex
FRONTMATTER_REGEX = re.compile(r'^---\s+.*?\s+---', re.DOTALL)
FOOTER_REGEX = re.compile(r'\n\s*\*\*\[End of .*?\]\*\*\s*$', re.DOTALL)

def ensure_output_dir():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

def load_posts_from_csv(lang):
    csv_path = os.path.join(BASE_DIR, f"{lang}_posts.csv")
    if not os.path.exists(csv_path):
        print(f"Error: CSV not found at {csv_path}. Please run generate_reports.py first.")
        return []
    
    posts = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            posts.append(row)
    
    # Sort by order just in case
    posts.sort(key=lambda x: int(x['order']) if x['order'].isdigit() else 0)
    return posts

def clean_content(content):
    # Remove frontmatter
    content = FRONTMATTER_REGEX.sub('', content).strip()
    
    # Remove footer (heuristic)
    # Usually matches **[End of ... continues in ...]** at the end
    # We strip first to ensure anchors match end of string
    content = FOOTER_REGEX.sub('', content).strip()
    
    return content

def get_file_content(post, lang):
    # Construct path from CSV data
    # Path in CSV is just the slug usually? Let's check CSV format.
    # The CSV has 'path' which is the slug (folder name).
    # The 'category' is also in CSV.
    # Structure: .../posts/{lang}/{category}/{slug}/index.mdx
    
    category = post.get('category', '').lower() # category usually lower in path?
    # Actually categories in path might correspond to how they are on disk.
    # generate_reports.py extracts category from parent folder name.
    
    slug = post.get('path', '')
    
    # We need to find the file. Since casing might vary, maybe we should use the scan logic?
    # Or just try to construct path. Lowercase category/slug is a safe bet for the path structure if standardized.
    # But let's rely on constructing it.
    
    file_path = os.path.join(CONTENT_ROOT, lang, category, slug, "index.mdx")
    
    # Try case insensitive search if not found
    if not os.path.exists(file_path):
        # Fallback: search in lang dir
        lang_dir = os.path.join(CONTENT_ROOT, lang)
        found = False
        for root, dirs, files in os.walk(lang_dir):
            if "index.mdx" in files:
                parent = os.path.basename(root)
                if parent == slug:
                    file_path = os.path.join(root, "index.mdx")
                    found = True
                    break
        if not found:
            print(f"Warning: Could not find file for {slug}")
            return ""

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def compile_phase(posts, phase_name, lang, output_filename):
    # Filter posts
    filtered = [p for p in posts if p.get('canon_phase', '').lower() == phase_name.lower()]
    
    if not filtered:
        print(f"No posts found for {phase_name} ({lang})")
        return

    output_path = os.path.join(OUTPUT_DIR, output_filename)
    print(f"Compiling {len(filtered)} posts into {output_filename}...")
    
    with open(output_path, 'w', encoding='utf-8') as outfile:
        # Title of Manuscript
        outfile.write(f"DRUSNIEL - {phase_name.upper()} ({lang.upper()})\n")
        outfile.write("="*40 + "\n\n")
        
        for post in filtered:
            raw_content = get_file_content(post, lang)
            if not raw_content: continue
            
            cleaned = clean_content(raw_content)
            
            # Header for parsed text
            title = post.get('title', 'Untitled')
            
            # If Main, maybe add Chapter info?
            if phase_name.lower() == 'main':
                chap = post.get('chapter')
                sub = post.get('subchapter')
                if chap and sub:
                    header = f"Chapter {chap}.{sub} | {title}"
                else:
                    header = title
            else:
                header = title
            
            outfile.write(f"\n\n{'#'*10} {header} {'#'*10}\n\n")
            outfile.write(cleaned)
            outfile.write("\n\n" + "-"*20 + "\n")
            
    print(f"Saved to {output_path}")

def main():
    ensure_output_dir()
    
    langs = ['en', 'es']
    phases = [
        ('lore', 'lore'),
        ('prequel', 'prequels'),
        ('main', 'chapters'),
        ('prologue', 'prologue')
    ]
    
    for lang in langs:
        posts = load_posts_from_csv(lang)
        if not posts: continue
        
        for phase_key, filename_base in phases:
            compile_phase(posts, phase_key, lang, f"{filename_base}_{lang}.txt")

if __name__ == "__main__":
    main()
