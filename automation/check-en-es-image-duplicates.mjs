#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const postsRoot = path.join(repoRoot, 'site', 'content', 'posts');
const enRoot = path.join(postsRoot, 'en');
const esRoot = path.join(postsRoot, 'es');

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function isImagePath(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dirPath, filterFn) {
  const results = [];
  const pending = [dirPath];

  while (pending.length > 0) {
    const current = pending.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(absPath);
      } else if (!filterFn || filterFn(absPath)) {
        results.push(absPath);
      }
    }
  }

  return results;
}

async function hashFile(filePath) {
  const fileBuffer = await fs.readFile(filePath);
  return createHash('sha256').update(fileBuffer).digest('hex');
}

async function main() {
  if (!(await pathExists(enRoot))) {
    throw new Error(`Missing EN posts directory: ${enRoot}`);
  }
  if (!(await pathExists(esRoot))) {
    throw new Error(`Missing ES posts directory: ${esRoot}`);
  }

  const [enImages, esImages] = await Promise.all([
    walkFiles(enRoot, isImagePath),
    walkFiles(esRoot, isImagePath)
  ]);

  const hashIndex = new Map();

  for (const filePath of enImages) {
    const hash = await hashFile(filePath);
    const size = (await fs.stat(filePath)).size;
    const entry = hashIndex.get(hash) || { size, en: [], es: [] };
    entry.en.push(filePath);
    hashIndex.set(hash, entry);
  }

  for (const filePath of esImages) {
    const hash = await hashFile(filePath);
    const size = (await fs.stat(filePath)).size;
    const entry = hashIndex.get(hash) || { size, en: [], es: [] };
    entry.es.push(filePath);
    hashIndex.set(hash, entry);
  }

  const crossLangDuplicates = [];
  let duplicateFileCount = 0;
  let removableBytes = 0;

  for (const [hash, group] of hashIndex) {
    if (group.en.length === 0 || group.es.length === 0) continue;
    const total = group.en.length + group.es.length;
    duplicateFileCount += total;
    removableBytes += (total - 1) * group.size;
    crossLangDuplicates.push({ hash, ...group });
  }

  if (crossLangDuplicates.length === 0) {
    console.log('No EN/ES duplicate images found under site/content/posts.');
    return;
  }

  console.error(`EN/ES duplicate image groups: ${crossLangDuplicates.length}`);
  console.error(`Duplicate files involved: ${duplicateFileCount}`);
  console.error(`Removable bytes (keeping one canonical copy per hash): ${removableBytes}`);
  console.error('First 20 duplicate groups:');

  for (const group of crossLangDuplicates.slice(0, 20)) {
    console.error(`- hash=${group.hash} size=${group.size} en=${group.en.length} es=${group.es.length}`);
    for (const enPath of group.en.slice(0, 2)) {
      console.error(`  EN: ${toPosixPath(path.relative(repoRoot, enPath))}`);
    }
    for (const esPath of group.es.slice(0, 2)) {
      console.error(`  ES: ${toPosixPath(path.relative(repoRoot, esPath))}`);
    }
  }

  process.exit(1);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
