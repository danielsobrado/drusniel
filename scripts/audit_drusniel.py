import os
import re

CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "content", "posts")

def main():
    files = []
    for root, dirs, filenames in os.walk(CONTENT_DIR):
        for f in filenames:
            if f == "index.mdx":
                files.append(os.path.join(root, f))
    
    drusniel_files = []
    
    print("Files found:", len(files))
    
    for fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Check if storyline drusniel or category umbrakor
        if "category: Umbra'kor" in content or "storyline: drusniel" in content:
            # extract chapter
            match = re.search(r"^##\s+(?:Chapter|Cap[íi]tulo)\s+(\d+(?:\.\d+)?)\s*", content, re.MULTILINE)
            if match:
                chap = match.group(1)
                order_match = re.search(r"order:\s+(\d+)", content)
                order = int(order_match.group(1)) if order_match else 0
                title_match = re.search(r"title:\s+\"(.*?)\"", content)
                title = title_match.group(1) if title_match else "No Title"
                
                drusniel_files.append((order, chap, title, fpath))

    drusniel_files.sort(key=lambda x: x[0])
    
    with open("drusniel_chapters.log", "w", encoding="utf-8") as log:
        log.write(f"{'Order':<8} {'Chap':<8} {'Title'}\n")
        log.write("-" * 60 + "\n")
        for o, c, t, p in drusniel_files:
            log.write(f"{o:<8} {c:<8} {t[:40]}\n")
    print("Written to drusniel_chapters.log")

if __name__ == "__main__":
    main()
