#!/usr/bin/env python3
"""
Analyze chapters to find which ones are missing header images (image.jpg).
Outputs a report of chapters that need artwork.
"""

import os
from pathlib import Path
import yaml

# Paths
POSTS_DIR = Path(__file__).parent.parent / "site" / "content" / "posts"
OUTPUT_FILE = Path(__file__).parent / "missing_images_report.md"


def extract_frontmatter(file_path):
    """Extract YAML frontmatter from MDX file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        return {}

    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}

    try:
        return yaml.safe_load(parts[1])
    except yaml.YAMLError:
        return {}


def check_image_exists(chapter_dir):
    """Check if image.jpg exists in the chapter directory."""
    image_path = chapter_dir / "image.jpg"
    return image_path.exists()


def analyze_chapters():
    """Analyze all chapters and find missing images."""
    results = {
        'missing': [],
        'has_image': [],
        'by_category': {},
        'by_type': {}
    }

    for lang in ['en', 'es']:
        lang_dir = POSTS_DIR / lang
        if not lang_dir.exists():
            continue

        for category_dir in lang_dir.iterdir():
            if not category_dir.is_dir():
                continue

            category = category_dir.name

            for chapter_dir in category_dir.iterdir():
                if not chapter_dir.is_dir():
                    continue

                index_file = chapter_dir / "index.mdx"
                if not index_file.exists():
                    continue

                frontmatter = extract_frontmatter(index_file)
                if not frontmatter:
                    continue

                # Only check English files (ES will mirror EN images)
                if lang == 'es':
                    continue

                has_image = check_image_exists(chapter_dir)

                entry = {
                    'path': str(chapter_dir.relative_to(POSTS_DIR.parent.parent)),
                    'title': frontmatter.get('title', 'Unknown'),
                    'category': category,
                    'type': frontmatter.get('type', 'Unknown'),
                    'chapter': frontmatter.get('chapter'),
                    'subchapter': frontmatter.get('subchapter'),
                    'canon_sequence': frontmatter.get('canon_sequence', ''),
                    'publication_order': frontmatter.get('publication_order', 0),
                    'storyline': frontmatter.get('storyline', 'unknown')
                }

                if has_image:
                    results['has_image'].append(entry)
                else:
                    results['missing'].append(entry)

                    # Track by category
                    if category not in results['by_category']:
                        results['by_category'][category] = []
                    results['by_category'][category].append(entry)

                    # Track by type
                    content_type = entry['type']
                    if content_type not in results['by_type']:
                        results['by_type'][content_type] = []
                    results['by_type'][content_type].append(entry)

    # Sort missing by publication order
    results['missing'].sort(key=lambda x: x['publication_order'])

    return results


def generate_report(results):
    """Generate markdown report."""
    lines = []
    lines.append("# Missing Header Images Report")
    lines.append("")
    lines.append(f"**Total chapters with images:** {len(results['has_image'])}")
    lines.append(f"**Total chapters missing images:** {len(results['missing'])}")
    lines.append("")

    # Summary by type
    lines.append("## Summary by Type")
    lines.append("")
    lines.append("| Type | Missing |")
    lines.append("|------|---------|")
    for content_type, entries in sorted(results['by_type'].items()):
        lines.append(f"| {content_type} | {len(entries)} |")
    lines.append("")

    # Summary by category
    lines.append("## Summary by Category")
    lines.append("")
    lines.append("| Category | Missing |")
    lines.append("|----------|---------|")
    for category, entries in sorted(results['by_category'].items()):
        lines.append(f"| {category} | {len(entries)} |")
    lines.append("")

    # Detailed list - Main chapters
    main_missing = [e for e in results['missing'] if e['type'] == 'Main']
    if main_missing:
        lines.append("## Main Chapters Missing Images")
        lines.append("")
        lines.append("| Chapter | Title | Category | Storyline |")
        lines.append("|---------|-------|----------|-----------|")
        for entry in sorted(main_missing, key=lambda x: x['publication_order']):
            ch = f"Ch {entry['chapter']}.{entry['subchapter']}" if entry['chapter'] else "—"
            lines.append(f"| {ch} | {entry['title'][:50]} | {entry['category']} | {entry['storyline']} |")
        lines.append("")

    # Detailed list - Prologues
    prologue_missing = [e for e in results['missing'] if e['type'] == 'Prologue']
    if prologue_missing:
        lines.append("## Prologues Missing Images")
        lines.append("")
        lines.append("| Canon Seq | Title | Category |")
        lines.append("|-----------|-------|----------|")
        for entry in sorted(prologue_missing, key=lambda x: x['publication_order']):
            lines.append(f"| {entry['canon_sequence']} | {entry['title'][:50]} | {entry['category']} |")
        lines.append("")

    # Detailed list - Lore
    lore_missing = [e for e in results['missing'] if e['type'] == 'Lore']
    if lore_missing:
        lines.append("## Lore Missing Images")
        lines.append("")
        lines.append("| Canon Seq | Title | Category |")
        lines.append("|-----------|-------|----------|")
        for entry in sorted(lore_missing, key=lambda x: x['publication_order']):
            lines.append(f"| {entry['canon_sequence']} | {entry['title'][:50]} | {entry['category']} |")
        lines.append("")

    # Full path list for easy reference
    lines.append("## Full Paths (for reference)")
    lines.append("")
    lines.append("```")
    for entry in sorted(results['missing'], key=lambda x: x['publication_order']):
        lines.append(entry['path'])
    lines.append("```")

    return "\n".join(lines)


def main():
    print("Analyzing chapters for missing images...")
    results = analyze_chapters()

    report = generate_report(results)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\nResults:")
    print(f"  Chapters with images: {len(results['has_image'])}")
    print(f"  Chapters missing images: {len(results['missing'])}")
    print(f"\nReport saved to: {OUTPUT_FILE}")

    # Print quick summary
    if results['missing']:
        print("\nMissing by type:")
        for content_type, entries in sorted(results['by_type'].items()):
            print(f"  {content_type}: {len(entries)}")


if __name__ == "__main__":
    main()
