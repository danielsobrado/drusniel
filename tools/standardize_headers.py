import os
import csv
import re
import shutil

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
        'Part': 'Part',
        'Footer': '**[End of {current} — continues in {next_seq}: {next_title}]**',
        'FooterMain': '**[End of Chapter {c_num}.{p_num} — continues in Chapter {n_num}.{np_num}: {next_title}]**'
    },
    'es': {
        'Lore': 'Lore', 'Main': 'Capítulo', 'Prequel': 'Prólogo', 'Prologue': 'Prólogo',
        'Part': 'Parte',
        'Footer': '**[Fin de {current} — continúa en {next_seq}: {next_title}]**',
        'FooterMain': '**[Fin del Capítulo {c_num}.{p_num} — continúa en el Capítulo {n_num}.{np_num}: {next_title}]**'
    }
}

def load_csv(filepath):
    posts = []
    if not os.path.exists(filepath):
        return []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            posts.append(row)
    # Sort by order
    posts.sort(key=lambda x: int(x.get('order', 0)) if x.get('order', '0').isdigit() else 0)
    return posts

def build_main_mapping(posts):
    mapping = {}
    for p in posts:
        seq = p.get('canon_sequence')
        chap = p.get('chapter')
        sub = p.get('subchapter')
        
        if seq and chap and sub and str(chap).isdigit() and str(sub).isdigit():
            # Get subtitle from title if possible, or use full title
            title = p.get('title', '')
            if ':' in title:
                subtitle = title.split(':', 1)[1].strip()
            else:
                subtitle = title
                
            mapping[seq] = {
                'chap': int(chap),
                'part': int(sub),
                'subtitle': subtitle
            }
    return mapping

def find_file_by_sequence(target_seq, lang):
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.mdx') or file.endswith('.md'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                except:
                    continue
                
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
    main_map = build_main_mapping(posts)
    
        # Helper to find file (cached in main_map if possible, but let's just create a global map)
        # Note: We can create a sequence->filepath map first
        
    # --- BUILD FILE MAP FIRST ---
    seq_to_path = {}
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.mdx') or file.endswith('.md'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    seq_match = re.search(r'canon_sequence:\s*([^\s]+)', content)
                    lang_match = re.search(r'language:\s*([^\s]+)', content)
                    
                    if seq_match and lang_match:
                        s = seq_match.group(1).strip()
                        l = lang_match.group(1).strip()
                        if l == lang:
                            seq_to_path[s] = (filepath, content)
                except:
                    continue

    for i in range(len(posts)):
        current_post = posts[i]
        next_post = posts[i+1] if i < len(posts) - 1 else None
        
        seq = current_post.get('canon_sequence')
        if not seq: continue
        
        # FIND CURRENT FILE
        if seq not in seq_to_path: continue
        filepath, content = seq_to_path[seq]
            
        # Split Frontmatter
        parts = content.split('---', 2)
        if len(parts) < 3: continue
            
        frontmatter = parts[1]
        body = parts[2]
        
        # --- CLEAN OLD ARTIFACTS ---
        body = body.strip()
        body = re.sub(r'^---\s*', '', body).strip()
        body = re.sub(r'^#+.*?\n', '', body).strip()
        body = re.sub(r'^---\s*', '', body).strip()
        body = re.sub(r'\s*\*\*\[.*?\]\*\*\s*$', '', body, flags=re.DOTALL).strip()
        
        # --- GENERATE NEW HEADER ---
        p_type = current_post.get('type', 'Main')
        p_title = current_post.get('title', '')
        
        labels = TRANS[lang]
        
        if seq in main_map:
            # Main Post
            info = main_map[seq]
            chap_num = info['chap']
            part_num = info['part']
            # Header: ## Capítulo X | Parte Y
            header_text = f"{labels['Main']} {chap_num} | {labels['Part']} {part_num}"
        else:
            # Lore/Prequel
            p_cat_label = labels.get(p_type, p_type)
            header_text = f"{p_cat_label} | {p_title}"

        new_header_block = f"\n\n## {header_text}\n\n--- \n\n"
        
        # --- GENERATE NEW FOOTER ---
        new_footer = ""
        if next_post:
            n_seq = next_post.get('canon_sequence')
            n_title = next_post.get('title')
            
            # CALCULATE RELATIVE LINK
            link_path = ""
            if n_seq in seq_to_path:
                next_filepath, _ = seq_to_path[n_seq]
                # Calculate relative path from current file's directory to next file
                rel_path = os.path.relpath(next_filepath, os.path.dirname(filepath))
                link_path = rel_path.replace('\\', '/')
            
            # If both are Main, use nice numbering
            if seq in main_map and n_seq in main_map:
                c_info = main_map[seq]
                n_info = main_map[n_seq]
                n_subtitle = n_info['subtitle']
                
                ft = labels['FooterMain'].replace('{next_title}', '[{next_title}](' + link_path + ')')
                new_footer = f"\n\n{ft.format(c_num=c_info['chap'], p_num=c_info['part'], n_num=n_info['chap'], np_num=n_info['part'], next_title=n_subtitle)}"
            else:
                # Fallback footer
                ft = labels['Footer'].replace('{next_title}', '[{next_title}](' + link_path + ')')
                
                # Helper to format IDs nicely
                def format_id(seq_id, type_label):
                    final_label = type_label
                    if seq_id.startswith('L-'):
                        final_label = labels.get('Lore', 'Lore')
                    elif seq_id.startswith('P-'):
                        final_label = labels.get('Prologue', 'Prólogo')

                    def strip_zeros(s):
                        return str(int(s)) if s.isdigit() else s

                    match = re.search(r'-(\d+)$', seq_id)
                    if match:
                        num = strip_zeros(match.group(1))
                        return f"{final_label} {num}"
                    return seq_id

                c_label = labels.get('Lore') if seq.startswith('L-') else labels.get('Prologue', 'Prólogo')
                n_label = labels.get('Lore') if n_seq.startswith('L-') else labels.get('Prologue', 'Prólogo')

                c_friendly = format_id(seq, c_label)
                n_friendly = format_id(n_seq, n_label)

                new_footer = f"\n\n{ft.format(current=c_friendly, next_seq=n_friendly, next_title=n_title)}"

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
