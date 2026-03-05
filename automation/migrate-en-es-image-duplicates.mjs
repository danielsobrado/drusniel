#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const postsRoot = path.join(repoRoot, 'site', 'content', 'posts');
const enRoot = path.join(postsRoot, 'en');
const esRoot = path.join(postsRoot, 'es');

const args = new Set(process.argv.slice(2));
if (args.has('--help')) {
  console.log(`Usage: node automation/migrate-en-es-image-duplicates.mjs [--apply]

Rewrites ES post image references to canonical EN image files when the files are byte-identical.
Without --apply it runs in dry mode and reports planned changes.
`);
  process.exit(0);
}

const applyChanges = args.has('--apply');

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isImagePath(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isMarkdownPath(filePath) {
  return MARKDOWN_EXTENSIONS.has(path.extname(filePath).toLowerCase());
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

function getCounterpartDir(markdownContent, postDir) {
  const match = markdownContent.match(/^counterpart_path:\s*(.+)\s*$/m);
  if (!match) return null;

  const rawValue = match[1].trim().replace(/^['"]|['"]$/g, '');
  if (!rawValue) return null;

  const normalized = rawValue.replace(/\//g, path.sep);
  let counterpartFilePath;
  if (path.isAbsolute(normalized)) {
    counterpartFilePath = normalized;
  } else if (rawValue.startsWith('site/')) {
    counterpartFilePath = path.join(repoRoot, normalized);
  } else {
    counterpartFilePath = path.resolve(postDir, normalized);
  }

  return path.dirname(counterpartFilePath);
}

function chooseCanonicalEnPath(enCandidates, preferredDir, esFileName) {
  if (!enCandidates || enCandidates.length === 0) return null;

  const normalizedPreferredDir = preferredDir ? path.resolve(preferredDir) : null;
  const lowerName = esFileName.toLowerCase();

  if (normalizedPreferredDir) {
    const inPreferredDir = enCandidates.filter(
      filePath => path.dirname(filePath) === normalizedPreferredDir
    );
    const exactNameInPreferred = inPreferredDir.find(
      filePath => path.basename(filePath).toLowerCase() === lowerName
    );
    if (exactNameInPreferred) return exactNameInPreferred;
    if (inPreferredDir.length > 0) return [...inPreferredDir].sort()[0];
  }

  const exactName = enCandidates.find(
    filePath => path.basename(filePath).toLowerCase() === lowerName
  );
  if (exactName) return exactName;

  return [...enCandidates].sort()[0];
}

function formatFrontmatterPathValue(relativePath) {
  if (/[\s:#]/.test(relativePath)) {
    return `'${relativePath}'`;
  }
  return relativePath;
}

function rewriteReferences(content, sourceName, targetRelativePath) {
  const escapedName = escapeRegExp(sourceName);
  let updated = content;
  let replacements = 0;

  const applyReplace = (regex, replacement) => {
    updated = updated.replace(regex, (...args) => {
      replacements += 1;
      const groups = args.slice(1, -2);
      let result = replacement;
      groups.forEach((value, index) => {
        result = result.replace(new RegExp(`\\$${index + 1}`, 'g'), value ?? '');
      });
      return result;
    });
  };

  applyReplace(
    new RegExp(`(^thumbnail:\\s*)(["']?)(?:\\.\\/)?${escapedName}\\2\\s*$`, 'gm'),
    `$1${formatFrontmatterPathValue(targetRelativePath)}`
  );

  applyReplace(
    new RegExp(
      `(\\]\\()(?:(?:\\.\\/)?${escapedName})(?=(?:\\s+["'][^"']*["'])?\\))`,
      'g'
    ),
    `$1${targetRelativePath}`
  );

  applyReplace(
    new RegExp(`(src\\s*=\\s*["'])(?:(?:\\.\\/)?${escapedName})(["'])`, 'g'),
    `$1${targetRelativePath}$2`
  );

  applyReplace(
    new RegExp(`(poster\\s*=\\s*["'])(?:(?:\\.\\/)?${escapedName})(["'])`, 'g'),
    `$1${targetRelativePath}$2`
  );

  applyReplace(
    new RegExp(`(^\\[[^\\]]+\\]:\\s*)(?:(?:\\.\\/)?${escapedName})(\\s*$)`, 'gm'),
    `$1${targetRelativePath}$2`
  );

  return {
    content: updated,
    replacements
  };
}

function hasLocalReference(content, sourceName) {
  const escapedName = escapeRegExp(sourceName);
  const checks = [
    new RegExp(`(^thumbnail:\\s*)(["']?)(?:\\.\\/)?${escapedName}\\2\\s*$`, 'm'),
    new RegExp(
      `\\]\\((?:\\.\\/)?${escapedName}(?=(?:\\s+["'][^"']*["'])?\\))`
    ),
    new RegExp(`src\\s*=\\s*["'](?:\\.\\/)?${escapedName}["']`),
    new RegExp(`poster\\s*=\\s*["'](?:\\.\\/)?${escapedName}["']`),
    new RegExp(`^\\[[^\\]]+\\]:\\s*(?:\\.\\/)?${escapedName}(?:\\s+.*)?$`, 'm')
  ];
  return checks.some(regex => regex.test(content));
}

async function main() {
  if (!(await pathExists(enRoot))) {
    throw new Error(`Missing EN posts directory: ${enRoot}`);
  }
  if (!(await pathExists(esRoot))) {
    throw new Error(`Missing ES posts directory: ${esRoot}`);
  }

  const enImagePaths = await walkFiles(enRoot, isImagePath);
  const hashToEnPaths = new Map();

  for (const enImagePath of enImagePaths) {
    const hash = await hashFile(enImagePath);
    const entries = hashToEnPaths.get(hash) || [];
    entries.push(enImagePath);
    hashToEnPaths.set(hash, entries);
  }

  const esIndexFiles = await walkFiles(esRoot, filePath =>
    path.basename(filePath).toLowerCase() === 'index.mdx'
  );

  const filesToWrite = new Map();
  const filesToDelete = new Set();

  let duplicateCandidates = 0;
  let rewrittenReferences = 0;
  let unresolvedDuplicateFiles = 0;
  let migratedImageFiles = 0;

  for (const indexPath of esIndexFiles) {
    const postDir = path.dirname(indexPath);
    const dirEntries = await fs.readdir(postDir, { withFileTypes: true });

    const markdownFiles = dirEntries
      .filter(entry => entry.isFile() && isMarkdownPath(entry.name))
      .map(entry => path.join(postDir, entry.name));

    if (markdownFiles.length === 0) continue;

    const markdownState = new Map();
    for (const markdownFile of markdownFiles) {
      const original = await fs.readFile(markdownFile, 'utf8');
      markdownState.set(markdownFile, { original, content: original });
    }

    const primaryState = markdownState.get(indexPath);
    const primaryContent = primaryState ? primaryState.content : '';
    const preferredEnDir = getCounterpartDir(primaryContent, postDir);

    const imageFiles = dirEntries
      .filter(entry => entry.isFile() && isImagePath(entry.name))
      .map(entry => path.join(postDir, entry.name));

    for (const esImagePath of imageFiles) {
      const imageName = path.basename(esImagePath);
      const imageHash = await hashFile(esImagePath);
      const enCandidates = hashToEnPaths.get(imageHash);
      if (!enCandidates || enCandidates.length === 0) {
        continue;
      }

      duplicateCandidates += 1;

      const canonicalEnPath = chooseCanonicalEnPath(
        enCandidates,
        preferredEnDir,
        imageName
      );
      if (!canonicalEnPath) {
        unresolvedDuplicateFiles += 1;
        continue;
      }

      let targetRelativePath = toPosixPath(path.relative(postDir, canonicalEnPath));
      if (!targetRelativePath.startsWith('.')) {
        targetRelativePath = `./${targetRelativePath}`;
      }

      for (const markdownFile of markdownFiles) {
        const currentState = markdownState.get(markdownFile);
        const currentContent = currentState.content;
        const { content: nextContent, replacements } = rewriteReferences(
          currentContent,
          imageName,
          targetRelativePath
        );
        if (replacements > 0) {
          rewrittenReferences += replacements;
          markdownState.set(markdownFile, {
            ...currentState,
            content: nextContent
          });
        }
      }

      const stillReferencedLocally = [...markdownState.values()].some(state =>
        hasLocalReference(state.content, imageName)
      );

      if (!stillReferencedLocally) {
        filesToDelete.add(esImagePath);
        migratedImageFiles += 1;
      } else {
        unresolvedDuplicateFiles += 1;
      }
    }

    for (const [markdownFile, state] of markdownState) {
      if (state.content !== state.original) {
        filesToWrite.set(markdownFile, state.content);
      }
    }
  }

  if (applyChanges) {
    for (const [filePath, content] of filesToWrite) {
      await fs.writeFile(filePath, content, 'utf8');
    }

    for (const filePath of filesToDelete) {
      await fs.unlink(filePath);
    }
  }

  const mode = applyChanges ? 'APPLY' : 'DRY RUN';
  console.log(`[${mode}] ES posts scanned: ${esIndexFiles.length}`);
  console.log(`[${mode}] Duplicate ES image candidates: ${duplicateCandidates}`);
  console.log(`[${mode}] Markdown files updated: ${filesToWrite.size}`);
  console.log(`[${mode}] Reference replacements: ${rewrittenReferences}`);
  console.log(`[${mode}] ES duplicate images migrated: ${migratedImageFiles}`);
  console.log(`[${mode}] ES images deleted: ${filesToDelete.size}`);
  console.log(`[${mode}] Remaining unresolved duplicate images: ${unresolvedDuplicateFiles}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
