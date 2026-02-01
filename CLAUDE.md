# CLAUDE.md - Drusniel Project Guidelines

## Project Overview
Drusniel is a dark fantasy fiction project with bilingual content (EN/ES). Content is organized into three tiers: Lore, Prequel, and Main chapters.

---

## Content Schema

### Frontmatter Fields (Required)
```yaml
publication_order: 330           # Unique integer for sorting
canon_phase: main                # lore | prequel | main
canon_sequence: M-030            # L-001, P-007, M-030 format
title: "Chapter Title"
category: Umbra'kor              # Region/arc name
author: Drusniel                 # Always Drusniel for main content
tags: ['#arc name', '#character', '#location']
date: 2024-11-17                 # Aligned with publication_order
thumbnail: image.jpg
featured: false
language: en                     # en | es
```

### Order Ranges
| Phase | EN Range | ES Range | Sequence Format |
|-------|----------|----------|-----------------|
| Lore | 101-199 | 1101-1199 | L-001 to L-099 |
| Prequel | 200-299 | 1200-1299 | P-001 to P-099 |
| Main | 300-399 | 1300-1399 | M-001 to M-099 |

### Date Alignment
Dates increment with publication_order using base date 2024-04-01:
- Order 101 → 2024-04-02
- Order 250 → 2024-08-27
- Order 330 → 2024-11-17

---

## Path Structure
```
site/content/posts/en/<category>/<slug>/index.mdx
site/content/posts/es/<category>/<slug>/index.mdx
```
- `<category>`: Region/arc (e.g., `umbrakor`, `stonehold`, `wyrmreach`)
- `<slug>`: Kebab-case unique identifier

---

## POV Voice Rules

### Core Principle
> **Every prequel/lore character knows less than Drusniel at the corresponding point in the main story.**

### Lore Content (101-199)
**Voice**: Fragmentary, compiled, disputed

**Do:**
- Present as compiled fragments from multiple sources
- Include marginal notes that argue with the text
- Use contradictory accounts (2-3 versions minimum)
- End with missing pages, burned sections, unresolved questions
- Frame knowledge as institutional belief, not truth

**Don't:**
- Explain cosmic mechanics definitively
- Provide clean origins for mysterious elements
- Use confident, informed narration

**Example:**
```
❌ "Wyrmreach was designed to contain..."
✅ "Some claim it was built. Others say it grew. Vorogarth stopped asking which was true."
```

### Prequel Content (200-299)
**Voice**: Limited POV, local stakes

**Do:**
- Keep stakes local and physical (grain, borders, patrols)
- Show characters wrong in interesting ways
- Anchor to tangible artifacts: reports, sermons, supply lists
- End with unverified sightings, filing errors, ignored warnings

**Don't:**
- Grant characters strategic foresight
- Use "this will matter" framing
- Reveal truths the main story depends on delaying

**Example:**
```
❌ "Lumeshire stands ready."
✅ "Lumeshire believed it had time."
```

### Main Content (300+)
**Voice**: Drusniel's direct experience, real-time discovery

---

## POV by Author Type

| Author | Voice Style | Blind Spots |
|--------|-------------|-------------|
| Bureaucrat/Scribe | Files reports, copies figures | Sees doctrine, not reality |
| Border Guard | Watches treelines | Only sees local threats |
| Engineer/Foreman | Structural assessments | Frames everything as mechanical |
| Sage/Compiler | Collects fragments | Cannot resolve contradictions |

---

## Ending Rules

Every lore/prequel must end with one of:
- An unanswered question
- A disappeared person
- An unverified report
- A "problem solved" that isn't
- A missing/burned page
- A warning filed too low to matter

**If the ending feels confident, revise.**

---

## PREQUEL CONSTRAINT SHEET (LOCKED)

**Status**: Canon rule — applies to ALL prequels (Lore + Prequel categories)

### Core Constraint (Non-Negotiable)

> **A prequel may not state, confirm, or correctly explain any truth that Drusniel has not personally verified at the equivalent point in the main story.**

If a sentence answers a question the chapters delay → **cut or reframe**.

### Knowledge Ceiling Rule

Each prequel POV must obey:
- Knows less than the reader
- Knows far less than the truth
- Is capable of being wrong

**Forbidden Knowledge** (prequel POV may NOT):
- Explain the Nexus
- Correctly describe the barrier's purpose
- Name Wyrmreach as a prison realm
- State prophecy as real, inevitable, or accurate
- Use "designed," "built," or "intended" for ancient systems

**Allowed**:
- Rumors, beliefs, superstition
- Institutional doctrine
- Conflicting theories

### Language Filters (Hard Rules)

**❌ Forbidden Phrases:**
- "It is known that…"
- "The truth of…"
- "In reality…"
- "This proves…"
- "Inevitably"
- "Designed to" / "Created for"

**✅ Required Replacements:**
- "They believed…"
- "Some claimed…"
- "The records disagree…"
- "No one could explain…"
- "It was said…"

**If certainty appears → downgrade it.**

### Structural Density Rule

- Prequels must be **rarer than chapters**
- Never publish two high-density prequels back-to-back
- One prequel = texture, not foundation

### Final Gate Check (must pass ALL)

Before publishing, answer **YES** to all:
1. Is the POV possibly wrong?
2. Does this create questions instead of answers?
3. Would removing this prequel weaken the story more than it clarifies it?

**If any answer is "no" → revise.**

---

## Pre-Publication Checklist

Before publishing any lore or prequel, verify:
- [ ] Does this character know less than Drusniel at this point?
- [ ] Could this belief be wrong?
- [ ] Does the piece end with uncertainty or error?
- [ ] Are cosmic elements fragmentary, not explanatory?
- [ ] Are threats localized, not structural?
- [ ] No forbidden phrases present?
- [ ] Passes all three Final Gate Check questions?

---

## Tagging Conventions
- Use hashtags in `tags` frontmatter: `['#the road from zuraldi', '#drusniel']`
- Tags are lowercase, words separated by spaces, prefixed with `#`
- Include: character, location, artifact, and arc/series tags

---

## Bilingual Workflow
- Spanish files are direct translations of English originals
- ES `publication_order` = EN order + 1000
- Titles and tags are translated appropriately
- Dates match between language pairs

---

## Content Body Conventions
- First heading after frontmatter: `# Chapter 1.4 | Title Here`
- Spanish: `# Capítulo 1.4 | Título Aquí`
- Use em-dashes (—) for dialogue in Spanish

---

## Key Reference Files
- `rules/GUIDELINES.md` - Detailed POV voice guidelines
- `rules/WORLDBUILDING/` - Story bible and world details
- `rules/CHAPTER_STRUCTURE/` - Chapter outlines and beat sheets
