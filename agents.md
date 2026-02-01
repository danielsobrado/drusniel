# Agents and Content Conventions

## Tagging Conventions
- Use hashtags in the `tags` frontmatter field for each post, e.g.:
  - `#the road from zuraldi`, `#drusniel`, `#dulint`, `#balin`, `#artifact`, `#stonehold`
- Tags are always lowercase, words separated by spaces, and prefixed with `#`.
- Use character, location, artifact, and arc/series tags as appropriate.

## Path and Folder Structure
- English: `site/content/posts/en/<category>/<slug>/index.mdx`
- Spanish: `site/content/posts/es/<category>/<slug>/index.mdx`
- `<category>` is the world/region/arc (e.g. `umbrakor`, `stonehold`).
- `<slug>` is a kebab-case, descriptive, unique identifier for the section (e.g. `the-road-from-zuraldi-the-awakening`).

## File Naming and Metadata
- Each section/scene is a folder with an `index.mdx` file.
- Frontmatter fields:
  - `order`: Sequential, unique integer (EN: 334+, ES: 1334+ for Chapter 0)
  - `title`: Full title, with arc and section (e.g. `The Road from Zuraldi: The Awakening`)
  - `category`: Arc/world (e.g. `Stonehold`)
  - `author`: Always `Drusniel`
  - `tags`: See above
  - `date`: Sequential, daily, ISO format (e.g. `2024-05-19`)
  - `thumbnail`: Always `image.jpg` (user to supply actual image)
  - `featured`: `false`
  - `language`: `en` or `es`

## Translation and Bilingual Workflow
- Spanish files are direct translations of English originals, with matching order and date.
- Titles and tags are translated appropriately.

## Content Body Conventions
- The first content heading after frontmatter must include both the chapter and subchapter (e.g., `# Chapter 1.4 | Shadows in the Hall` / `# Capítulo 1.4 | Sombras en el Salón`).

## Chapter and Section Numbering
- Chapter 0 (East) comes after Chapter 7 in timeline and order.
- Order numbers are strictly sequential across all chapters.
- Each section within a chapter gets its own folder and order number.

## Example
```
site/content/posts/en/stonehold/the-road-from-zuraldi-the-awakening/index.mdx
site/content/posts/es/stonehold/el-camino-de-zuraldi-el-despertar/index.mdx
```

---
This document is maintained as a reference for all agents and contributors.
