import os
import csv
import re

# Configurations
BASE_DIR = r'c:\Development\workspace\GitHub\drusniel\site\content\posts'
REPORTS_DIR = r'c:\Development\workspace\GitHub\drusniel\reports'

CSV_FILES = {
    'en': os.path.join(REPORTS_DIR, 'en_posts.csv'),
    'es': os.path.join(REPORTS_DIR, 'es_posts.csv')
}

TRANS = {
    'en': {
        'Lore': 'Lore', 'Main': 'Chapter', 'Prequel': 'Prequel', 'Prologue': 'Prologue',
        'Footer': '**[End of {current} — continues in {next_seq}: {next_title}]**'
    },
    'es': {
        'Lore': 'Lore', 'Main': 'Capítulo', 'Prequel': 'Precuela', 'Prologue': 'Prólogo',
        'Footer': '**[Fin de {current} — continúa en {next_seq}: {next_title}]**'
    }
}

def load_csv(filepath):
    posts = []
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            posts.append(row)
    # Sort by order just in case
    posts.sort(key=lambda x: int(x.get('order', 0)) if x.get('order', '0').isdigit() else 0)
    return posts

def find_file_by_sequence(target_seq, lang):
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.mdx') or file.endswith('.md'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                seq_match = re.search(r'canon_sequence:\s*([^\s]+)', content)
                lang_match = re.search(r'language:\s*([^\s]+)', content)
                
                if seq_match and lang_match:
                    f_seq = seq_match.group(1).strip()
                    f_lang = lang_match.group(1).strip()
                    
                    if f_seq == target_seq and f_lang == lang:
                        return filepath, content
    return None, None

def process_language(lang):
    print(f"Processing {lang}...")
    posts = load_csv(CSV_FILES[lang])
    
    for i in range(len(posts)):
        current_post = posts[i]
        next_post = posts[i+1] if i < len(posts) - 1 else None
        
        seq = current_post.get('canon_sequence')
        if not seq:
            continue
            
        filepath, content = find_file_by_sequence(seq, lang)
        if not filepath:
            # print(f"Warning: File not found for sequence {seq}")
            continue
            
        # Split Frontmatter
        parts = content.split('---', 2)
        if len(parts) < 3:
            continue
            
        frontmatter = parts[1]
        body = parts[2]
        
        # --- CLEAN HEADER OLD ARTIFACTS ---
        # Strip initial whitespace
        body = body.strip()
        
        # 1. Remove leading separator if present (regex ^---)
        body = re.sub(r'^---\s*', '', body).strip()
        
        # 2. Remove leading Header line (regex ^#+ .*)
        body = re.sub(r'^#+.*?\n', '', body).strip()
        
        # 3. Remove trailing separator of the header block if present
        body = re.sub(r'^---\s*', '', body).strip()
        
        # Now body should be "clean" text starting with content.
        
        # --- GENERATE NEW HEADER ---
        p_type = current_post.get('type', 'Main')
        p_title = current_post.get('title', '')
        type_label = TRANS[lang].get(p_type, p_type)
        header_text = f"{type_label} | {p_title}"
        
        new_header_block = f"\n\n--- \n\n## {header_text}\n\n--- \n\n"
        
        # --- CLEAN FOOTER OLD ARTIFACTS ---
        # Remove existing footer if it matches pattern **[ ... ]** at end
        body = re.sub(r'\s*\*\*\[.*?\]\*\*\s*$', '', body, flags=re.DOTALL)
        body = body.strip()

        # --- GENERATE NEW FOOTER ---
        new_footer = ""
        if next_post:
            n_title = next_post.get('title')
            n_seq = next_post.get('canon_sequence')
            footer_template = TRANS[lang]['Footer']
            current_id = seq 
            next_id = n_seq
            new_footer = f"\n\n{footer_template.format(current=current_id, next_seq=next_id, next_title=n_title)}"

        # Reassemble
        new_content = f"---{frontmatter}---{new_header_block}{body}{new_footer}"
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

def main():
    if os.path.exists(CSV_FILES['en']):
        process_language('en')
    if os.path.exists(CSV_FILES['es']):
        process_language('es')

if __name__ == '__main__':
    main()
