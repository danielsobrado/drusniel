import os
import re

# Configuration
CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "content", "posts")

PREFERRED_ORDER = [
    "publication_order", "order", "title", "date", "language", 
    "chapter", "subchapter", "storyline", 
    "canon_phase", "canon_sequence", "narrative_weight", 
    "category", "author", "type", 
    "tags", "thumbnail", "featured", 
    "counterpart_path", "counterpart_title"
]

def parse_frontmatter(content):
    match = re.search(r'^---\s+(.*?)\s+---', content, re.DOTALL)
    if not match:
        return {}, content
    
    fm_text = match.group(1)
    body = content[match.end():]
    
    data = {}
    current_key = None
    
    lines = fm_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        if not stripped or stripped.startswith('#'):
            i += 1
            continue
            
        if ':' in line:
            if stripped.startswith('-') and current_key == 'tags':
                if 'tags' not in data: data['tags'] = []
                val = stripped.lstrip('- ').strip()
                if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')): val = val[1:-1]
                data['tags'].append(val)
            else:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip()
                
                if key == 'tags' and val.startswith('[') and val.endswith(']'):
                    tag_list = []
                    inner = val[1:-1]
                    parts = inner.split(',')
                    for p in parts:
                        p = p.strip()
                        if (p.startswith("'") and p.endswith("'")) or (p.startswith('"') and p.endswith('"')): p = p[1:-1]
                        tag_list.append(p)
                    data[key] = tag_list
                    current_key = key
                elif not val and i + 1 < len(lines) and lines[i+1].strip().startswith('-'):
                    data[key] = []
                    current_key = key
                else:
                    if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')): val = val[1:-1]
                    if val.lower() == 'true': val = True
                    elif val.lower() == 'false': val = False
                    elif val.isdigit(): val = int(val)
                    elif val.lower() == 'null': val = None
                    
                    data[key] = val
                    current_key = key
        elif stripped.startswith('-') and current_key:
             if isinstance(data[current_key], list):
                val = stripped.lstrip('- ').strip()
                if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')): val = val[1:-1]
                data[current_key].append(val)
        i += 1
        
    return data, body

def update_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            full_content = f.read()
            
        data, body = parse_frontmatter(full_content)
        if not data: return

        # Rules:
        # If Main -> Ensure chapter/subchapter are ints (already handled by migrate script largely)
        # If Lore/Prequel/Prologue -> Ensure chapter/subchapter exist and are null
        
        canon_phase = str(data.get("canon_phase", "")).lower()
        
        if canon_phase in ['lore', 'prequel', 'prologue']:
            if 'chapter' not in data:
                data['chapter'] = None
            if 'subchapter' not in data:
                data['subchapter'] = None
        
        # Checking Storyline Existence (should be there from previous script, but safe to verify)
        if 'storyline' not in data:
            # Fallback logic if needed, but verify script complained about missing fields
            # Assuming migrate script ran, storyline should be there. 
            # If verify script complained, maybe migrate script missed some file types?
            pass

        # Reconstruct Frontmatter
        lines = ["---"]
        for key in PREFERRED_ORDER:
            if key in data:
                val = data[key]
                if val is None:
                    lines.append(f"{key}: null")
                    continue
                    
                if key == 'tags':
                    if isinstance(val, list):
                        lines.append("tags:")
                        for t in val:
                            lines.append(f"  - '{t}'")
                    else:
                        lines.append(f"tags: {val}")
                elif isinstance(val, bool):
                    lines.append(f"{key}: {str(val).lower()}")
                else:
                    if isinstance(val, str) and (":" in val or "#" in val) and not (val.startswith('"') or val.startswith("'")):
                        lines.append(f'{key}: "{val}"')
                    else:
                        lines.append(f"{key}: {val}")
                        
        lines.append("---")
        lines.append("") 
        
        final_content = "\n".join(lines) + body
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
            
        print(f"Fixed {os.path.basename(file_path)}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    print(f"Scanning {CONTENT_DIR}...")
    for root, dirs, files in os.walk(CONTENT_DIR):
        for file in files:
            if file == "index.mdx":
                full_path = os.path.join(root, file)
                update_file(full_path)

if __name__ == "__main__":
    main()
