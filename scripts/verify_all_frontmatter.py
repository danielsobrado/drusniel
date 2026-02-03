import os
import frontmatter
import sys

# Configuration
CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "content", "posts")

def verify_file(file_path):
    issues = []
    try:
        post = frontmatter.load(file_path)
        data = post.metadata
        
        # Check required fields
        required_fields = ['storyline', 'chapter', 'subchapter', 'canon_phase', 'canon_sequence']
        
        for field in required_fields:
            if field not in data:
                issues.append(f"Missing field: {field}")
                
        # Check types and logic
        phase = data.get('canon_phase', '').lower()
        
        if phase == 'main':
            if not isinstance(data.get('chapter'), int):
                issues.append(f"Main content 'chapter' must be int, got {type(data.get('chapter'))}: {data.get('chapter')}")
            if not isinstance(data.get('subchapter'), int):
                issues.append(f"Main content 'subchapter' must be int, got {type(data.get('subchapter'))}: {data.get('subchapter')}")
        
        elif phase in ['lore', 'prequel', 'prologue']:
            # For non-main, allow null or missing? User asked they "appear".
            # So if they exist, they should be None or consistent?
            # If the user wants them to appear, they should arguably be null if not used.
            pass

    except Exception as e:
        issues.append(f"Error parsing: {e}")
        
    return issues

def main():
    print(f"Verifying content in {CONTENT_DIR}...")
    
    files_with_issues = 0
    total_files = 0
    
    for root, dirs, files in os.walk(CONTENT_DIR):
        for file in files:
            if file == "index.mdx":
                total_files += 1
                fpath = os.path.join(root, file)
                issues = verify_file(fpath)
                
                if issues:
                    files_with_issues += 1
                    print(f"\n[FAIL] {os.path.relpath(fpath, CONTENT_DIR)}")
                    for issue in issues:
                        print(f"  - {issue}")
                        
    print(f"\nVerification Complete.")
    print(f"Total Files: {total_files}")
    print(f"Files with Issues: {files_with_issues}")
    
    if files_with_issues > 0:
        sys.exit(1)

if __name__ == "__main__":
    main()
