import os
import re

# Configuration
CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "content", "posts")

# Mappings
CATEGORY_TO_STORYLINE = {
    "umbrakor": "drusniel",
    "stonehold": "west",
    "lumeshire": "prologue", 
    "wyrmreach": "west",
    "riverhold": "east",
    "astalor": "lore",
    "contian": "lore",
    "frostgard": "prequel", # Adjust based on canon phase
    "elenoria": "prequel",
    "grukmar": "prequel",
}

PREFERRED_ORDER = [
    "publication_order", "order", "title", "date", "language", 
    "chapter", "subchapter", "storyline", 
    "canon_phase", "canon_sequence", "narrative_weight", 
    "category", "author", "type", 
    "tags", "thumbnail", "featured", 
    "counterpart_path", "counterpart_title"
]

LORE_CATEGORIES = ["astalor", "contian", "lumeshire", "wyrmreach"] # Stonehold can be both?


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
            # Check if it's a list item (tags)
            if stripped.startswith('-') and current_key == 'tags':
                if 'tags' not in data: data['tags'] = []
                val = stripped.lstrip('- ').strip()
                if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                    val = val[1:-1]
                data['tags'].append(val)
            else:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip()
                
                # Handle inline list [a, b] for tags
                if key == 'tags' and val.startswith('[') and val.endswith(']'):
                    tag_list = []
                    inner = val[1:-1]
                    parts = inner.split(',')
                    for p in parts:
                        p = p.strip()
                        if (p.startswith("'") and p.endswith("'")) or (p.startswith('"') and p.endswith('"')):
                            p = p[1:-1]
                        tag_list.append(p)
                    data[key] = tag_list
                    current_key = key
                elif not val and i + 1 < len(lines) and lines[i+1].strip().startswith('-'):
                    # Multiline list
                    data[key] = []
                    current_key = key
                else:
                    # Scalar
                    # Remove quotes
                    if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                        val = val[1:-1]
                    
                    # Convert types
                    if val.lower() == 'true': val = True
                    elif val.lower() == 'false': val = False
                    elif val.isdigit(): val = int(val)
                    
                    data[key] = val
                    current_key = key
        elif stripped.startswith('-') and current_key:
             # Continued list
             if isinstance(data[current_key], list):
                val = stripped.lstrip('- ').strip()
                if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                    val = val[1:-1]
                data[current_key].append(val)
        
        i += 1
        
    return data, body

def get_storyline(data, category):
    phase = str(data.get("canon_phase", "")).lower()
    if phase == "lore":
        return "lore"
    if phase == "prequel":
        return "prequel" # Assuming prequel is its own storyline line or belongs to prequel phase
    if phase == "prologue":
        return "prologue"
    
    # For Main phase
    cat_lower = category.lower()
    if cat_lower in CATEGORY_TO_STORYLINE:
        return CATEGORY_TO_STORYLINE[cat_lower]
    
    return "drusniel" # Default fallback for main

def parse_header_chapter(content, lang="en"):
    if lang == "es":
        regex = r"^##\s+Cap[íi]tulo\s+(\d+(?:\.\d+)?)\s*\|\s*Parte\s+(\d+)"
    else:
        regex = r"^##\s+Chapter\s+(\d+(?:\.\d+)?)\s*\|\s*Part\s+(\d+)"
        
    match = re.search(regex, content, re.MULTILINE)
    if match:
        chap_str = match.group(1)
        part_str = match.group(2)
        chap_num = int(float(chap_str)) # handle 6.0 or 6
        return chap_num, int(part_str)
    
    # Simple Format
    if lang == "es":
         regex_simple = r"^##\s+Cap[íi]tulo\s+(\d+(?:\.\d+)?)"
    else:
         regex_simple = r"^##\s+Chapter\s+(\d+(?:\.\d+)?)"
         
    match_simple = re.search(regex_simple, content, re.MULTILINE)
    if match_simple:
         chap_str = match_simple.group(1)
         chap_num = int(float(chap_str))
         return chap_num, 1 
         
    return None, None

def determine_main_chapter_info(data, content, storyline, lang):
    """Returns (chapter, subchapter, sequence)."""
    
    # 1. Stonehold / West -> Chapter 8
    if storyline == "west":
        chapter = 8
        seq = str(data.get("canon_sequence", ""))
        # Expected W1-001 -> subchapter 1
        match = re.search(r"W\d+-0*(\d+)", seq)
        if match:
            subchapter = int(match.group(1))
        else:
            subchapter = 1
        
        prefix = "W"
        new_seq = f"{prefix}-{chapter:03}-{subchapter:03}"
        return chapter, subchapter, new_seq

    # 2. Drusniel
    elif storyline == "drusniel":
        c, s = parse_header_chapter(content, lang)
        if c is not None:
            # Keep D prefix
            prefix = "D"
            new_seq = f"{prefix}-{c:03}-{s:03}"
            return c, s, new_seq
        
    return None, None, str(data.get("canon_sequence", ""))

def update_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            full_content = f.read()
            
        data, body = parse_frontmatter(full_content)
        if not data:
            print(f"Skipping {file_path} (no frontmatter)")
            return

        category = str(data.get("category", ""))
        canon_phase = str(data.get("canon_phase", "")).lower()
        lang = str(data.get("language", "en"))
        
        if category.lower() in ["astalor", "contian", "lumeshire", "wyrmreach"]:
            canon_phase = "lore"
            data["canon_phase"] = "lore"
            data["type"] = "Lore"
            storyline = "lore"
            data["storyline"] = "lore"

        storyline = get_storyline(data, category)
        # Force lore again if needed? get_storyline handles it if phase is lore.
        
        data['storyline'] = storyline
        
        chapter = None
        subchapter = None
        new_header = None
        
        if canon_phase == "main":
            c, s, seq = determine_main_chapter_info(data, body, storyline, lang)
            if c is not None:
                chapter = c
                subchapter = s
                data['chapter'] = c
                data['subchapter'] = s
                data['canon_sequence'] = seq
                
                # Prepare Header Update
                if lang == "es":
                    new_header_line = f"## Capítulo {c}.{s} | Parte {s}"
                    # Use stricter regex to replace ONLY the main chapter header, avoid false positives
                    body = re.sub(r"^##\s+Cap[íi]tulo\s+\d+(\.\d+)?.*$", new_header_line, body, flags=re.MULTILINE)
                else:
                    new_header_line = f"## Chapter {c}.{s} | Part {s}"
                    body = re.sub(r"^##\s+Chapter\s+\d+(\.\d+)?.*$", new_header_line, body, flags=re.MULTILINE)
        
        elif canon_phase == "prologue":
            data['chapter'] = None
            # Keep canon_sequence as is or normalize? User said: P-LUM-001 format
            pass
            
        elif canon_phase == "lore" or canon_phase == "prequel":
             pass
             # No chapter field for these implies not added? 
             # Or explicit null? User didn't specify null for Lore/Prequel, but implied structure.
             # I'll leave 'chapter' out of the dict if it's not main/prologue, or set to null?
             # User said "Lore remains...". Likely no chapter field required.

        # Reconstruct Frontmatter
        lines = ["---"]
        
        # Add known keys in order
        for key in PREFERRED_ORDER:
            if key in data:
                val = data[key]
                if val is None:
                    lines.append(f"{key}: null") # or omit? User used 'null' in example
                    continue
                    
                if key == 'tags':
                    if isinstance(val, list):
                        lines.append("tags:")
                        for t in val:
                            lines.append(f"  - '{t}'")
                    else:
                        lines.append(f"tags: {val}") # Should be list usually
                elif isinstance(val, bool):
                    lines.append(f"{key}: {str(val).lower()}")
                else:
                    # Check for strings needing quotes
                    if isinstance(val, str) and (":" in val or "#" in val) and not (val.startswith('"') or val.startswith("'")):
                        lines.append(f'{key}: "{val}"')
                    else:
                        lines.append(f"{key}: {val}")
                        
        lines.append("---")
        lines.append("") # Empty line after FM
        
        # Reconstruct Content
        final_content = "\n".join(lines) + body
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
        
        print(f"Updated {os.path.basename(file_path)}: Storyline={storyline}, Chap={chapter}")

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
