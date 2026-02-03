import os
import re

CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "content", "posts")

# Definition of the sequence to merge into Chapter 7
# We assume sort by order identifies them correctly.
# The audit showed that existing Chapter 7 ends at 7.5 (Order 1042).
# Chapter 8 starts at Order 1045.
# We want to remap Chapter 8, 9, 10, 11 to Chapter 7.
# Starting subchapter for Order 1045 should be 6.

def update_file_header_and_frontmatter(file_path, new_chap, new_subchap, lang="en"):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update Frontmatter
    # Regex to find chapter/subchapter/canon_sequence
    # We'll use a robust approach: replace lines.
    
    # Update chapter
    content = re.sub(r"^chapter:\s*\d+", f"chapter: {new_chap}", content, flags=re.MULTILINE)
    
    # Update subchapter
    content = re.sub(r"^subchapter:\s*\d+", f"subchapter: {new_subchap}", content, flags=re.MULTILINE)
    
    # Update canon_sequence (D-XXX-YYY)
    # We need to preserve the prefix (D, W, etc)? Drusniel is D.
    new_seq = f"D-{new_chap:03}-{new_subchap:03}"
    content = re.sub(r"^canon_sequence:\s*[\w-]+", f"canon_sequence: {new_seq}", content, flags=re.MULTILINE)
    
    # 2. Update Header
    if lang == "es":
        new_header = f"## Capítulo {new_chap}.{new_subchap} | Parte {new_subchap}"
        content = re.sub(r"^##\s+Cap[íi]tulo\s+\d+(\.\d+)?.*$", new_header, content, flags=re.MULTILINE)
    else:
        new_header = f"## Chapter {new_chap}.{new_subchap} | Part {new_subchap}"
        content = re.sub(r"^##\s+Chapter\s+\d+(\.\d+)?.*$", new_header, content, flags=re.MULTILINE)

    # 3. Footer? 
    # The footer often contains "[End of UMB-M-XXX ..."
    # Updating this is hard without context. But standardizing headers is key.
    # The Standardization script should handle footers if run later.
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {os.path.basename(file_path)} -> {new_chap}.{new_subchap}")

def main():
    # Identify files to update (Drusniel storyline, currently Ch 8-11)
    # We can rely on the order range.
    # Ch 8 starts at 1045. Ch 11 ends at 1105.
    
    files_to_process = []
    
    for root, dirs, filenames in os.walk(CONTENT_DIR):
        for f in filenames:
            if f == "index.mdx":
                fpath = os.path.join(root, f)
                with open(fpath, 'r', encoding='utf-8') as file:
                    raw = file.read()
                
                # Check criteria
                is_drusniel = "storyline: drusniel" in raw
                if not is_drusniel: continue
                
                # Check order
                match = re.search(r"order:\s+(\d+)", raw)
                if match:
                    order = int(match.group(1))
                    if 1045 <= order <= 1105: # EN range
                        files_to_process.append((order, fpath, "en"))
                    elif 11045 <= order <= 11105: # ES range
                        files_to_process.append((order, fpath, "es"))
                        
    # Sort by order
    files_to_process.sort(key=lambda x: x[0])
    
    # Process EN and ES separately to track subchapter index
    en_files = [x for x in files_to_process if x[2] == "en"]
    es_files = [x for x in files_to_process if x[2] == "es"]
    
    # Start subchapter for Ch 7 continuation (after 7.5) -> 6
    current_sub = 6
    for _, fpath, lang in en_files:
        update_file_header_and_frontmatter(fpath, 7, current_sub, lang)
        current_sub += 1
        
    current_sub = 6
    for _, fpath, lang in es_files:
        update_file_header_and_frontmatter(fpath, 7, current_sub, lang)
        current_sub += 1

if __name__ == "__main__":
    main()
