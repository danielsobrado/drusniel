\# WRITING WORKFLOW QUICK REFERENCE



\## Pass Settings at a Glance



| Pass | Extended Thinking | Temperature | Purpose |

|------|-------------------|-------------|---------|

| 1. Outline | ON | 0.7 | Chapter arc \& structure |

| 2. Beat Sheet | ON | 0.6 | Scene-level detail |

| 3. Prose Draft | \*\*OFF\*\* | 0.5-0.6 | Actual writing |

| 4. Consistency | ON | 0.3 | Canon verification |

| 5. Voice Lock | \*\*OFF\*\* | 0.4 | Style alignment |

| 6. Show Don't Tell | \*\*OFF\*\* | 0.5 | Concrete detail |

| 7. Compression | \*\*OFF\*\* | 0.3 | Tightening |



---



\## Key Insight



\*\*Extended Thinking OFF for prose generation.\*\* If a human writer would perform worse by overthinking, so will Claude.



\*\*Extended Thinking ON for planning and analysis.\*\* Use for consistency checks, plot architecture, magic system verification.



---



\## Minimum Viable Workflow



For simpler scenes, compress to 3 passes:

1\. \*\*Plan\*\* (ET: ON) - Outline + Beat Sheet

2\. \*\*Draft\*\* (ET: OFF) - Prose generation

3\. \*\*Polish\*\* (ET: OFF) - Combined show-don't-tell + compression



---



\## Critical Phrases to Include



Every prose generation prompt should contain:

\- "Keep the imperfections that make this sound human"

\- "Do not add events beyond the specified beat"

\- "End at the specified story beat - do not continue further"

\- "This is scene X of Y - do not write a standalone piece"



---



\## Forbidden Words Checklist



Quick scan for AI tells:

\- \[ ] delve, tapestry, testament, myriad

\- \[ ] journey (metaphor), navigate (emotions)

\- \[ ] foster, underscores, multifaceted

\- \[ ] "It wasn't X, it was Y" structure

\- \[ ] "Little did they know..."

\- \[ ] "In that moment..."



---



\## Scene Quality Checklist



Before accepting a scene:

\- \[ ] Opens with grounding action?

\- \[ ] POV consistent throughout?

\- \[ ] Emotions shown, not told?

\- \[ ] Dialogue â‰ˆ 40% of content?

\- \[ ] No magic system violations?

\- \[ ] Ends at correct beat?

\- \[ ] Forward momentum preserved?



---



\## File Locations



```

/prompts/

â”œâ”€â”€ master\_system\_prompt.md    # Add to Claude Project

â”œâ”€â”€ pass1\_outline.md

â”œâ”€â”€ pass2\_beatsheet.md

â”œâ”€â”€ pass3\_prose\_draft.md       # Most used

â”œâ”€â”€ pass4\_consistency.md

â”œâ”€â”€ pass5\_voice\_lock.md

â”œâ”€â”€ pass6\_show\_dont\_tell.md

â””â”€â”€ pass7\_compression.md

```



---



\## Voice Sample Template



Include with every Pass 3 (Prose Draft):



```markdown

<voice\_sample>

\[Paste 2-3 paragraphs that exemplify your desired prose style.

Can be from published chapter, style reference, or ideal example.]

</voice\_sample>

```



---



\## When to Use Each Pass



\*\*Always Use\*\*: Pass 3 (Draft) + Pass 7 (Compression)



\*\*Use for Complex Scenes\*\*: Full 7-pass workflow



\*\*Use When Stuck\*\*: Pass 1-2 planning passes



\*\*Use After Major Edits\*\*: Pass 4 (Consistency)



\*\*Use When Voice Drifts\*\*: Pass 5 (Voice Lock)



\*\*Use for Emotional Scenes\*\*: Pass 6 (Show Don't Tell)

