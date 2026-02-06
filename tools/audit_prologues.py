import csv

def audit():
    print("Reading CSV...")
    items = []
    with open('reports/en_posts.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            if r.get('type') in ['Prequel', 'Prologue']:
                items.append(r)
    
    # Sort by order as int
    items.sort(key=lambda x: int(x.get('order', 0)) if x.get('order', '0').isdigit() else 0)

    output = []
    output.append(f"{'Sequence':<15} | {'Order':<5} | {'Type':<8} | {'Title'}")
    output.append('-'*60)
    for r in items:
        output.append(f"{r.get('canon_sequence',''):<15} | {r.get('order',''):<5} | {r.get('type',''):<8} | {r.get('title','')}")
    
    with open('reports/prologue_audit.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    print("Audit written to reports/prologue_audit.txt")

if __name__ == "__main__":
    audit()
