#!/usr/bin/env python3
"""
Script to copy index.mdx files from the posts folder structure
to an articles folder with proper naming.

Example:
  site/content/posts/en/astalor/magic-in-astalor/index.mdx
  becomes:
  articles/en/astalor/magic-in-astalor.md
"""

import os
import shutil
from pathlib import Path


def copy_articles():
    # Define source and destination paths
    script_dir = Path(__file__).parent
    source_root = script_dir / "site" / "content" / "posts"
    dest_root = script_dir / "articles"

    # Check if source directory exists
    if not source_root.exists():
        print(f"Error: Source directory not found: {source_root}")
        return

    # Clear the articles folder if it exists, then recreate it
    if dest_root.exists():
        shutil.rmtree(dest_root)
        print(f"Cleared existing articles folder: {dest_root}")
    
    dest_root.mkdir(parents=True, exist_ok=True)
    print(f"Created articles folder: {dest_root}")

    # Counter for copied files
    copied_count = 0

    # Walk through the source directory
    for root, dirs, files in os.walk(source_root):
        for file in files:
            if file == "index.mdx":
                source_file = Path(root) / file
                
                # Get the relative path from source_root
                # e.g., en/astalor/magic-in-astalor
                relative_path = Path(root).relative_to(source_root)
                
                # The parent folder name becomes the filename
                # e.g., magic-in-astalor becomes magic-in-astalor.md
                article_name = relative_path.name + ".md"
                
                # The path without the last folder becomes the destination directory
                # e.g., en/astalor
                dest_dir = dest_root / relative_path.parent
                
                # Create destination directory if it doesn't exist
                dest_dir.mkdir(parents=True, exist_ok=True)
                
                # Full destination path
                dest_file = dest_dir / article_name
                
                # Copy the file
                shutil.copy2(source_file, dest_file)
                copied_count += 1
                
                print(f"Copied: {relative_path}/index.mdx -> {dest_file.relative_to(script_dir)}")

    print(f"\nDone! Copied {copied_count} article(s) to {dest_root}")


if __name__ == "__main__":
    copy_articles()
