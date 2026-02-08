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
        'Lore': 'Lore',
        'Main': 'Chapter',
        'Prequel': 'Prequel',
        'Prologue': 'Prologue',
        'Part': 'Part',
        'Footer': '**End of {current} — continues in {next_seq}: {next_title}**',
        'FooterMain': '**End of Chapter {c_num}.{p_num} — continues in Chapter {n_num}.{np_num}: {next_title}**'
    },
    'es': {
        'Lore': 'Lore',
        'Main': 'Capítulo',
        'Prequel': 'Prólogo',
        'Prologue': 'Prólogo',
        'Part': 'Parte',
        'Footer': '**Fin de {current} — continúa en {next_seq}: {next_title}**',
        'FooterMain': '**Fin del Capítulo {c_num}.{p_num} — continúa en el Capítulo {n_num}.{np_num}: {next_title}**'
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

def build_chapter_part_counts(main_map):
    counts = {}
    for info in main_map.values():
        chap = info.get('chap')
        if isinstance(chap, int):
            counts[chap] = counts.get(chap, 0) + 1
    return counts

def format_main_display(info, labels, chapter_part_counts, for_header=False):
    chap_num = info['chap']
    part_num = info['part']
    part_count = chapter_part_counts.get(chap_num, 0)
    is_single_part = part_count == 1

    if for_header:
        if is_single_part:
            return f"{labels['Main']} {chap_num}"
        return f"{labels['Main']} {chap_num} | {labels['Part']} {part_num}"

    if is_single_part:
        return f"{labels['Main']} {chap_num}"
    return f"{labels['Main']} {chap_num}.{part_num}"

def build_route_post_link(post, lang, seq_to_correct_slug=None):
    seq = (post.get('canon_sequence') or '').strip()
    
    # Use the correct slug from counterpart mapping if available
    if seq and seq_to_correct_slug and seq in seq_to_correct_slug:
        correct_slug = seq_to_correct_slug[seq]
        return correct_slug if correct_slug.startswith('/') else f"/{correct_slug}/"
    
    # Fallback to path from CSV (folder name)
    slug = (post.get('path') or '').strip().strip('/')
    if slug:
        return f"/{slug}/"

    return "/"


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
    
    # Determine opposite language for counterpart lookup
    opposite_lang = 'es' if lang == 'en' else 'en'
    
    # --- SCAN ALL FILES AND BUILD DATA ---
    posts = []
    seq_to_path = {}
    seq_to_correct_slug = {}
    
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            if file.endswith('.mdx') or file.endswith('.md'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Extract frontmatter fields
                    seq_match = re.search(r'canon_sequence:\s*([^\s\n]+)', content)
                    lang_match = re.search(r'language:\s*([^\s\n]+)', content)
                    counterpart_match = re.search(r'counterpart_path:\s*([^\s\n]+)', content)
                    title_match = re.search(r'title:\s*["\']?([^"\'\n]+)["\']?', content)
                    order_match = re.search(r'publication_order:\s*(\d+)', content)
                    chapter_match = re.search(r'^chapter:\s*(\d+|null)', content, re.MULTILINE)
                    subchapter_match = re.search(r'^subchapter:\s*(\d+|null)', content, re.MULTILINE)
                    type_match = re.search(r'^type:\s*([^\s\n]+)', content, re.MULTILINE)
                    canon_phase_match = re.search(r'canon_phase:\s*([^\s\n]+)', content)
                    
                    if not seq_match or not lang_match:
                        continue
                        
                    s = seq_match.group(1).strip()
                    l = lang_match.group(1).strip()
                    
                    # If this is the opposite language file, its counterpart_path
                    # gives us the correct slug for the current language
                    if l == opposite_lang and counterpart_match:
                        counterpart_path = counterpart_match.group(1).strip()
                        if not counterpart_path.endswith('/'):
                            counterpart_path += '/'
                        seq_to_correct_slug[s] = counterpart_path
                    
                    # If this is the current language file, build post data
                    if l == lang:
                        seq_to_path[s] = (filepath, content)
                        
                        # Extract chapter/subchapter
                        chap = None
                        sub = None
                        if chapter_match and chapter_match.group(1) != 'null':
                            chap = chapter_match.group(1)
                        if subchapter_match and subchapter_match.group(1) != 'null':
                            sub = subchapter_match.group(1)
                        
                        post_data = {
                            'canon_sequence': s,
                            'title': title_match.group(1).strip() if title_match else '',
                            'order': int(order_match.group(1)) if order_match else 0,
                            'chapter': chap,
                            'subchapter': sub,
                            'type': type_match.group(1).strip() if type_match else 'Main',
                            'canon_phase': canon_phase_match.group(1).strip() if canon_phase_match else '',
                            'path': os.path.basename(os.path.dirname(filepath))  # folder name as fallback
                        }
                        posts.append(post_data)
                except:
                    continue
    
    # Sort posts by order
    posts.sort(key=lambda x: x.get('order', 0))
    
    # Build mappings for main chapters
    main_map = build_main_mapping(posts)
    chapter_part_counts = build_chapter_part_counts(main_map)


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
        body = re.sub(
            r'\n\n\*\*(?:\[)?(?:End of|Fin de)[^\n]*\*\*\s*$',
            '',
            body,
            flags=re.MULTILINE
        ).strip()
        
        # --- GENERATE NEW HEADER ---
        p_type = current_post.get('type', 'Main')
        p_title = current_post.get('title', '')
        
        labels = TRANS[lang]
        
        if seq in main_map:
            # Main Post
            info = main_map[seq]
            # Header: ## Chapter X | Part Y, or ## Chapter X for single-part chapters
            header_text = format_main_display(info, labels, chapter_part_counts, for_header=True)
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
            
            # Use canonical route slugs so MDX does not rewrite links as file assets.
            link_path = build_route_post_link(next_post, lang, seq_to_correct_slug)
            
            # Helper to detect label from canon_sequence
            def get_seq_label(seq_id):
                if '-L-' in seq_id or seq_id.startswith('L-'):
                    return labels.get('Lore', 'Lore')
                return labels.get('Prologue', 'Prologue')

            # Helper to format IDs nicely
            def format_id(seq_id):
                sl = get_seq_label(seq_id)
                match = re.search(r'-(\d+)$', seq_id)
                if match:
                    num = str(int(match.group(1)))
                    return f"{sl} {num}"
                return seq_id

            # Helper to get display name for a sequence
            def get_display(s, info_map):
                if s in info_map:
                    i = info_map[s]
                    return format_main_display(i, labels, chapter_part_counts)
                return format_id(s)

            # Helper to get link title
            def get_link_title(s, info_map, fallback_title):
                if s in info_map:
                    return info_map[s]['subtitle']
                return fallback_title

            current_display = get_display(seq, main_map)
            next_display = get_display(n_seq, main_map)
            link_title = get_link_title(n_seq, main_map, n_title)

            if lang == 'en':
                new_footer = f"\n\n**End of {current_display} \u2014 continues in {next_display}: [{link_title}]({link_path})**"
            else:
                new_footer = f"\n\n**Fin de {current_display} \u2014 contin\u00faa en {next_display}: [{link_title}]({link_path})**"

        # Reassemble
        new_content = f"---{frontmatter}---{new_header_block}{body}{new_footer}"
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")

def main():
    process_language('en')
    process_language('es')

if __name__ == '__main__':
    main()

