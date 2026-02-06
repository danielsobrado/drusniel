import os
import re

CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "content", "posts")

# Mapping Definition
# Logic: Key phrase in title -> (New Chapter, Start Subchapter Index Offset)
# basically we need to reset the subchapter counter for each new chapter.
# But since we scan files, we can just group them by their "Arc" and re-number them 1..N

ARCS = [
    # (Chapter Number, English Key, Spanish Key)
    (7, "The Surface Mage", "El Mago de Superficie"),
    (8, "Forbidden Knowledge", "Conocimiento Prohibido"),
    (9, "House Rivalry", "La Rivalidad de la Casa"),
    (10, "Blood in the Dark", "Sangre en la Oscuridad"),
    # Note: English title might be "Blood in Darkness" or "Blood in the Darkness", will match "Blood in"
    (11, "The Package", "El Paquete")
]

def get_arc_info(title):
    for chap, en_key, es_key in ARCS:
        if en_key in title or es_key in title:
            return chap
    return None

def update_file(file_path, new_chap, new_sub):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Chapter
    # Pattern: chapter: <number>
    content = re.sub(r"^chapter:\s*\d+", f"chapter: {new_chap}", content, flags=re.MULTILINE)

    # 2. Update Subchapter
    # Pattern: subchapter: <number>
    content = re.sub(r"^subchapter:\s*\d+", f"subchapter: {new_sub}", content, flags=re.MULTILINE)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {os.path.basename(file_path)} -> Ch {new_chap}.{new_sub}")

def process_language(lang_path):
    # Collect all Umbrakor files
    files = []
    
    for root, dirs, filenames in os.walk(lang_path):
        for f in filenames:
            if f == "index.mdx":
                fpath = os.path.join(root, f)
                with open(fpath, 'r', encoding='utf-8') as file:
                    raw = file.read()
                
                # Filter for Umbrakor / Drusniel storyline
                if "storyline: drusniel" not in raw and "category: Umbra'kor" not in raw:
                    continue
                    
                # Extract order to sort
                match = re.search(r"order:\s+(\d+)", raw)
                title_match = re.search(r"title:\s*[\"']?(.*?)[\"']?\n", raw)
                
                if match and title_match:
                    order = int(match.group(1))
                    title = title_match.group(1)
                    files.append({
                        'path': fpath,
                        'order': order,
                        'title': title
                    })

    # Sort by order
    files.sort(key=lambda x: x['order'])

    # Process
    # We need to track the current index for each Arc
    arc_counters = {} # { chap_num: current_subchapter }

    for f in files:
        title = f['title']
        chap = get_arc_info(title)
        
        if chap:
            # It belongs to one of our target arcs
            if chap not in arc_counters:
                arc_counters[chap] = 1
            
            sub = arc_counters[chap]
            update_file(f['path'], chap, sub)
            arc_counters[chap] += 1
        else:
            # Might be other chapters (1-6), ignore
            pass

def main():
    print("Restoring Chapters for EN...")
    process_language(os.path.join(CONTENT_DIR, "en"))
    
    print("\nRestoring Chapters for ES...")
    process_language(os.path.join(CONTENT_DIR, "es"))

if __name__ == "__main__":
    main()
