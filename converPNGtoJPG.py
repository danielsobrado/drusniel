#!/usr/bin/env python3

from __future__ import annotations

import argparse
import logging
import re
import sys
from pathlib import Path

from PIL import Image

INPUT_EXTENSION = ".png"
OUTPUT_EXTENSION = ".jpg"
DEFAULT_JPEG_QUALITY = 95
LANG_FOLDERS = ("en", "es")
LOG_FORMAT = "%(asctime)s - %(levelname)s - %(message)s"


def setup_logging(verbose: bool) -> logging.Logger:
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(level=level, format=LOG_FORMAT)
    return logging.getLogger(__name__)


def parse_args(default_posts_root: Path) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert local PNG images to JPG for EN/ES article folders."
    )
    parser.add_argument(
        "--posts-root",
        type=Path,
        default=default_posts_root,
        help=f"Posts root directory (default: {default_posts_root})",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=DEFAULT_JPEG_QUALITY,
        help=f"JPEG quality (default: {DEFAULT_JPEG_QUALITY})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview actions without modifying files.",
    )
    parser.add_argument(
        "--keep-png",
        action="store_true",
        help="Keep original PNG files after conversion.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug logging.",
    )
    return parser.parse_args()


def validate_quality(quality: int) -> None:
    if quality < 1 or quality > 100:
        raise ValueError("quality must be between 1 and 100")


def get_png_files(posts_root: Path) -> list[Path]:
    png_files: list[Path] = []
    for lang in LANG_FOLDERS:
        lang_dir = posts_root / lang
        if not lang_dir.exists():
            continue
        for file_path in lang_dir.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() == INPUT_EXTENSION:
                png_files.append(file_path)
    return sorted(png_files)


def _validate_jpeg(jpg_path: Path, expected_size: tuple[int, int]) -> bool:
    try:
        if not jpg_path.exists() or jpg_path.stat().st_size <= 0:
            return False
        with Image.open(jpg_path) as image_a:
            image_a.verify()
        with Image.open(jpg_path) as image_b:
            if (image_b.format or "").upper() != "JPEG":
                return False
            if image_b.size != expected_size:
                return False
        return True
    except Exception:
        return False


def convert_png_to_jpg(
    png_path: Path,
    quality: int,
    keep_png: bool,
    dry_run: bool,
    logger: logging.Logger,
) -> bool:
    jpg_path = png_path.with_suffix(OUTPUT_EXTENSION)
    if dry_run:
        logger.info("Would convert %s -> %s", png_path, jpg_path)
        return True

    try:
        with Image.open(png_path) as image:
            if image.mode in ("RGBA", "LA", "P"):
                base = Image.new("RGB", image.size, (255, 255, 255))
                if image.mode == "P":
                    image = image.convert("RGBA")
                base.paste(
                    image,
                    mask=image.split()[-1] if image.mode in ("RGBA", "LA") else None,
                )
                image = base
            else:
                image = image.convert("RGB")

            expected_size = image.size
            tmp_path = jpg_path.with_suffix(".jpg.tmp")
            image.save(tmp_path, "JPEG", quality=quality, optimize=True)

        if not _validate_jpeg(tmp_path, expected_size):
            logger.error("Validation failed for %s; keeping PNG.", png_path)
            tmp_path.unlink(missing_ok=True)
            return False

        if jpg_path.exists():
            jpg_path.unlink()
        tmp_path.rename(jpg_path)

        if not keep_png:
            png_path.unlink()

        logger.info("Converted %s -> %s", png_path, jpg_path)
        return True
    except Exception as error:
        logger.error("Failed to convert %s: %s", png_path, error)
        return False


def update_local_references(
    article_dir: Path,
    old_name: str,
    new_name: str,
    dry_run: bool,
    logger: logging.Logger,
) -> bool:
    index_path = article_dir / "index.mdx"
    if not index_path.exists():
        return False

    content = index_path.read_text(encoding="utf-8")
    updated = re.sub(re.escape(old_name), new_name, content)
    if updated == content:
        return False

    if dry_run:
        logger.info("Would update %s references in %s", old_name, index_path)
        return True

    index_path.write_text(updated, encoding="utf-8")
    logger.info("Updated references in %s", index_path)
    return True


def main() -> int:
    repo_root = Path(__file__).resolve().parent
    default_posts_root = repo_root / "site" / "content" / "posts"
    args = parse_args(default_posts_root)
    logger = setup_logging(args.verbose)

    try:
        validate_quality(args.quality)
    except ValueError as error:
        logger.error(str(error))
        return 1

    posts_root = args.posts_root.resolve()
    if not posts_root.exists():
        logger.error("Posts root not found: %s", posts_root)
        return 1

    png_files = get_png_files(posts_root)
    if not png_files:
        logger.info("No PNG files found under %s for EN/ES.", posts_root)
        return 0

    logger.info("Found %d PNG files to process.", len(png_files))
    converted_count = 0
    updated_refs_count = 0

    for png_path in png_files:
        converted = convert_png_to_jpg(
            png_path=png_path,
            quality=args.quality,
            keep_png=args.keep_png,
            dry_run=args.dry_run,
            logger=logger,
        )
        if not converted:
            continue

        converted_count += 1

        if not args.keep_png:
            refs_updated = update_local_references(
                article_dir=png_path.parent,
                old_name=png_path.name,
                new_name=png_path.with_suffix(OUTPUT_EXTENSION).name,
                dry_run=args.dry_run,
                logger=logger,
            )
            if refs_updated:
                updated_refs_count += 1

    logger.info(
        "Done. Converted: %d/%d, index files updated: %d.",
        converted_count,
        len(png_files),
        updated_refs_count,
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        logging.info("Conversion interrupted by user.")
        sys.exit(1)
