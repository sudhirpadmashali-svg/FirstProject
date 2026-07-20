# Cross-Border Release Notes — Markdown Schema Definition

This document defines the structure and rules for generating **AvaTax Cross-Border** Release Notes markdown files. It serves as the contract between Content Studio / the automation service and downstream systems (Knowledge Center, Zoomin) for the `.md` delivery format.

Unlike the North America Indirect Taxes schema — which is organized by a Country → State → Local **jurisdiction hierarchy** — Cross-Border Release Notes are organized by a **fixed set of topic sections** (de minimis, HS taxonomy, customs valuation, cross-border content), with content grouped by **content system** (e.g., HTS A, CN8, HS UK) rather than by jurisdiction.

---

## Schema Version

| Field | Value |
|---|---|
| Schema Version | 1.0 |
| Template Version | 2.0 (Custom — Cross-Border) |
| Format | Markdown (.md) |
| Encoding | UTF-8 |
| Owners | Srikanth Raghuram (CS Engineering), Pradip Patil (KC) |

---

## Document Structure Overview

```
[INTERNAL Metadata Block]                        ← Automation anchor — NEVER published
# Avalara AvaTax Cross-Border Release Notes      ← Document Title
  Release Date                                   ← Month Year
  Intro Paragraphs                               ← Standard boilerplate
  ## Release Note [Version] ([Month Year])       ← Release identifier
  ## Systems Updated                             ← Overview + Systems table
  ## Changes to De Minimis Rules                 ← Per-jurisdiction threshold changes
  ## Changes to HS Taxonomy                      ← Per-system additions/deletions
    ### [System Code] ([Region])                 ← System sub-section
  ## Changes to Customs Valuation Approaches     ← Narrative
  ## Updated Cross-Border Content                ← MFN + preferential updates
    ### [System Code] ([Region])                 ← System sub-section
  ## New Cross-Border Content Added              ← Newly added systems/content
  ## Supporting Resources                        ← Links
  Parent topic + Disclaimer                      ← Footer
```

---

## 1. Internal Metadata Block (Suppressed)

The template begins with an `[INTERNAL] Document Metadata Block` used as an automation anchor. **It must never appear in the published `.md` file.** It is populated before content generation and drives the automation service, but is stripped from all customer-facing output.

Fields in this block (all internal):

| Field | Provenance | Notes |
|---|---|---|
| `Template Version` | SYSTEM | e.g., `2.0` |
| `Template Type` | SYSTEM | `Custom — Cross-Border` |
| `Product` | SYSTEM | e.g., `AvaTax Cross-Border` |
| `Product Area` | SYSTEM | Jira Product Area value |
| `Release Version` | SYSTEM | e.g., `26.6.1.0` |
| `Fix Version` | SYSTEM | Jira Fix Version value |
| `Release Date` | SYSTEM | `YYYY-MM-DD` (internal ISO form) |
| `Content Sync Date` | SYSTEM | latest content synchronization date |
| `Content Library` | SYSTEM | from Documentation Mapping Repository |
| `Documentation Branch` | SYSTEM | e.g., `release-26.6` |
| `DITA Map ID` | SYSTEM | e.g., `AVATAX_XB_RN_MAP` |
| `Release Notes Required` | SYSTEM | `Yes` \| `No` |
| `Approval Status` | SYSTEM | `Draft` \| `In Review` \| `Approved` \| `Published` |
| `Publication Status` | SYSTEM | `Unpublished` \| `Scheduled` \| `Published` |
| `Validation Result` | SYSTEM | `Pass` \| `Fail` \| `Pending` |
| `Generation Timestamp` | SYSTEM | auto-populated by automation service |
| `Last Updated` | SYSTEM | auto-populated by automation service |

### Rules

- The entire block, including the `[INTERNAL] Document Metadata Block` heading, is removed from the delivered `.md`.
- Values from this block **may drive** the published content (e.g., `Release Version` populates the Release Note heading; `Release Date` is reformatted to `Month Year`), but the block itself is never rendered.

---

## 2. Document Title

```markdown
# Avalara AvaTax Cross-Border Release Notes
```

| Field | Rule |
|---|---|
| Title | Fixed string. Always `Avalara AvaTax Cross-Border Release Notes`. |
| Format | H1 heading. First published line of the document (after the suppressed internal block is stripped). |

---

## 3. Release Date

Immediately follows the title. Rendered in italics.

```markdown
*[Month Year]*
```

| Field | Type | Format | Description |
|---|---|---|---|
| `Release Date` | Date | `Month YYYY` | Human-readable release month, e.g., `June 2026`. Derived from the internal `Release Date` (`YYYY-MM-DD`). |

---

## 4. Intro Paragraphs

Standard boilerplate. Two paragraphs, verbatim.

```markdown
This is a summary of system updates. It includes de minimis rules, HS taxonomy changes, customs valuation approaches, and cross-border content updates.

Avalara regularly updates Knowledge Center content and this document may be out of date. Please check back frequently for updates.
```

| Rule | Description |
|---|---|
| Fixed text | Both paragraphs are static boilerplate and are not paraphrased. |
| Placement | Immediately after the Release Date. |

---

## 5. Release Note Heading

Introduces the specific release. H2.

```markdown
## Release Note [Version] ([Month Year])
```

| Field | Type | Format | Provenance | Description |
|---|---|---|---|---|
| `Version` | String | dotted version | SYSTEM | e.g., `26.6.1.0`. From internal `Release Version`. |
| `Month Year` | Date | `Month YYYY` | SYSTEM | Same value as the Release Date. |

---

## 6. Systems Updated

The first content section. An LLM-generated overview sentence followed by the Systems table.

```markdown
## Systems Updated

[Overview — LLM-GENERATED: summarize which content systems were refreshed. Effective dates reflect the latest available content synchronization.]

| System Code | System Name / Region | Effective Date |
|---|---|---|
| [System Code] | [System Name / Region] | [DD Mon YYYY] |
```

| Field | Type | Format | Provenance | Description |
|---|---|---|---|---|
| `Overview` | Text | Paragraph | LLM-GENERATED | Summary of refreshed systems. |
| `System Code` | String | — | SYSTEM | e.g., `HTS A`, `CN8`, `HS UK`. |
| `System Name / Region` | String | — | SYSTEM | e.g., `United States`, `European Union`, `United Kingdom`. |
| `Effective Date` | Date | `DD Mon YYYY` | SYSTEM | e.g., `01 Jul 2026`. |

### Rules

- One table row per refreshed system.
- The Systems table is always rendered; there is at least one system per release.

---

## 7. Changes to De Minimis Rules

Lists each jurisdiction whose de minimis threshold changed. Rendered inside a change block.

```markdown
## Changes to De Minimis Rules

**Jurisdiction:** [Jurisdiction]
**Update:** [What changed — new threshold and, where relevant, prior threshold]
**Effective From:** [DD Mon YYYY]
**Impact:** [Impact description]
```

| Field | Type | Format | Provenance | Description |
|---|---|---|---|---|
| `Jurisdiction` | String | — | SYSTEM | Country or region whose threshold changed. |
| `Update` | Text | Paragraph | LLM-GENERATED | New value and (if applicable) prior value. |
| `Effective From` | Date | `DD Mon YYYY` | SYSTEM | When the change takes effect. |
| `Impact` | Text | Paragraph | LLM-GENERATED | Business/compliance impact. |

### Rules

- One change block per affected jurisdiction.
- **Empty-section rule:** if no de minimis rules changed, render the single line: `No changes to de minimis rules in this release.`
- A trailing note may follow the change blocks, e.g., `No other de minimis rule changes in this release.`

---

## 8. Changes to HS Taxonomy

Chapter additions and deletions, grouped by content system under H3 sub-headings.

```markdown
## Changes to HS Taxonomy

### [System Code] ([Region])

**Additions:** [HS chapters added, e.g., 07 (Edible vegetables); 08 (Edible fruit and nuts)]
**Deletions:** [HS chapters deleted, or `none`]
```

| Field | Type | Provenance | Description |
|---|---|---|---|
| `System Code` | String | SYSTEM | e.g., `CN8`. |
| `Region` | String | SYSTEM | e.g., `European Union`. |
| `Additions` | Text | LLM-GENERATED | Added HS chapters with descriptions, or `none`. |
| `Deletions` | Text | LLM-GENERATED | Deleted HS chapters with descriptions, or `none`. |

### Rules

- One `### [System Code] ([Region])` sub-section per affected system.
- Within each sub-section, both `Additions` and `Deletions` are always shown; use `none` when there are no entries.
- **Empty-section rule:** if no taxonomy changes at all, render: `No HS taxonomy changes in this release.`

---

## 9. Changes to Customs Valuation Approaches

Narrative description of any changes to customs valuation methods.

```markdown
## Changes to Customs Valuation Approaches

[Description — LLM-GENERATED]
```

| Field | Type | Provenance | Description |
|---|---|---|---|
| Body | Text | LLM-GENERATED | Description of valuation method/approach changes. |

### Rules

- **Empty-section rule:** if nothing changed, render exactly: `No changes.`

---

## 10. Updated Cross-Border Content

MFN and preferential rate updates, grouped by content system under H3 sub-headings. Preceded by an LLM-generated overview.

```markdown
## Updated Cross-Border Content

[Overview — LLM-GENERATED: summarize MFN and preferential rate updates. Where volume is high, condense the full FTA list and note that it has been condensed.]

### [System Code] ([Region])

**MFN changes:** [Affected HS chapters, or `none`]
**Preferential changes:** [Affected agreements/countries and chapter coverage, or `none`]
```

| Field | Type | Provenance | Description |
|---|---|---|---|
| `Overview` | Text | LLM-GENERATED | Optional lead-in summarizing updates across systems. |
| `System Code` | String | SYSTEM | e.g., `HTS A`. |
| `Region` | String | SYSTEM | e.g., `United States`. |
| `MFN changes` | Text | LLM-GENERATED | Most-Favoured-Nation rate changes by chapter, or `none`. |
| `Preferential changes` | Text | LLM-GENERATED | FTA/preferential coverage changes, or `none`. |

### Rules

- One `### [System Code] ([Region])` sub-section per affected system.
- When the list of affected tariff lines / FTAs is large, condense it and add a note pointing to a coverage reference (e.g., `Full list of affected tariff lines has been condensed; see linked coverage reference for details.`).
- **Empty-section rule:** if no content was updated, render: `No changes.`

---

## 11. New Cross-Border Content Added

Describes any newly added systems, jurisdictions, or content sets.

```markdown
## New Cross-Border Content Added

[Description — LLM-GENERATED]
```

| Field | Type | Provenance | Description |
|---|---|---|---|
| Body | Text | LLM-GENERATED | Description of newly added systems/jurisdictions/content. |

### Rules

- **Empty-section rule:** if nothing was added, render exactly: `No changes.`

---

## 12. Supporting Resources

Links to help articles and coverage references.

```markdown
## Supporting Resources

- [Resource title](url)
- [Resource title](url)
```

| Field | Type | Provenance | Description |
|---|---|---|---|
| Resource link | Link | AUTHOR (if applicable) | `[text](url)` list item. |

### Rules

- Rendered only when one or more supporting resources exist. Omit the section entirely if none apply.
- Each resource is a Markdown link list item.

---

## 13. Footer

Closes the document.

```markdown
*Parent topic: AvaTax Cross-Border Release Notes*

---

Avalara regularly updates Knowledge Center content and this document may be out of date. Please check back frequently for updates. © Avalara Inc. [Year]
```

| Field | Type | Provenance | Description |
|---|---|---|---|
| `Parent topic` | String | SYSTEM | Fixed: `AvaTax Cross-Border Release Notes`. |
| Disclaimer | Text | SYSTEM | Fixed boilerplate. `[Year]` from the release year. |

---

## 14. Field Provenance Legend

Every field in the template is tagged with its source. These tags are internal markers and are **removed** from the published `.md` — only the resolved value remains.

| Tag | Meaning | Handling |
|---|---|---|
| `SYSTEM` | Populated by the automation service from Jira / Documentation Mapping / content metadata. | Value only; never invented by the LLM. |
| `LLM-GENERATED` | Narrative summary written by the LLM from the underlying change data. | Grounded in source data; no fabricated facts. |
| `AUTHOR` | Supplied manually by a content author (e.g., resource links), when applicable. | Optional; omit if not provided. |

---

## 15. Date Format Rules

Cross-Border published content uses the abbreviated-month day-first format (distinct from the NA schema's spelled-out month).

| Pattern | Format | Example |
|---|---|---|
| Effective / system dates | `DD Mon YYYY` | `01 Jul 2026` |
| Release month | `Month YYYY` | `June 2026` |
| Internal metadata dates | `YYYY-MM-DD` | `2026-06-01` (internal block only; never published) |
| Month (published body) | Three-letter abbreviation | `Jul`, not `July` or `07` |
| Day | Zero-padded two digits | `01`, not `1` |

---

## 16. Suppressed Fields

The following must **not** appear in the delivered `.md`:

| Field / Element | Reason |
|---|---|
| `[INTERNAL] Document Metadata Block` (entire block) | Automation anchor. Not customer-facing. |
| `[SYSTEM]` / `[LLM-GENERATED]` / `[AUTHOR]` provenance tags | Internal authoring markers. Only resolved values are published. |
| Jira `Product Area`, `Fix Version` | Internal tracking. |
| `Approval Status`, `Publication Status`, `Validation Result`, timestamps | Internal workflow state. |
| `DITA Map ID`, `Documentation Branch`, `Content Library` | Internal documentation-mapping metadata. |

---

## 17. Full Document Template

```markdown
# Avalara AvaTax Cross-Border Release Notes

*[Month Year]*

This is a summary of system updates. It includes de minimis rules, HS taxonomy changes, customs valuation approaches, and cross-border content updates.

Avalara regularly updates Knowledge Center content and this document may be out of date. Please check back frequently for updates.

## Release Note [Version] ([Month Year])

## Systems Updated

[Overview]

| System Code | System Name / Region | Effective Date |
|---|---|---|
| [Code] | [Name / Region] | [DD Mon YYYY] |

## Changes to De Minimis Rules

**Jurisdiction:** [Jurisdiction]
**Update:** [What changed]
**Effective From:** [DD Mon YYYY]
**Impact:** [Impact]

<!-- or: No changes to de minimis rules in this release. -->

## Changes to HS Taxonomy

### [System Code] ([Region])

**Additions:** [chapters, or none]
**Deletions:** [chapters, or none]

<!-- or: No HS taxonomy changes in this release. -->

## Changes to Customs Valuation Approaches

[Description, or: No changes.]

## Updated Cross-Border Content

[Overview]

### [System Code] ([Region])

**MFN changes:** [chapters, or none]
**Preferential changes:** [agreements/coverage, or none]

<!-- or: No changes. -->

## New Cross-Border Content Added

[Description, or: No changes.]

## Supporting Resources

- [Resource title](url)

*Parent topic: AvaTax Cross-Border Release Notes*

---

Avalara regularly updates Knowledge Center content and this document may be out of date. Please check back frequently for updates. © Avalara Inc. [Year]
```

---

## 18. Validation Rules

| Rule | Description |
|---|---|
| V.1 | The `[INTERNAL] Document Metadata Block` must never appear in the delivered `.md`. |
| V.2 | Document title must be exactly `Avalara AvaTax Cross-Border Release Notes`. |
| V.3 | All seven topic sections must appear in the fixed order: Systems Updated → De Minimis → HS Taxonomy → Customs Valuation → Updated Cross-Border Content → New Cross-Border Content Added → Supporting Resources. |
| V.4 | Sections with no changes must use the exact prescribed empty-section text (`No changes.`, `No HS taxonomy changes in this release.`, `No changes to de minimis rules in this release.`). |
| V.5 | Effective and system dates use `DD Mon YYYY`; the release month uses `Month YYYY`. |
| V.6 | Content in HS Taxonomy and Updated Cross-Border Content must be grouped under `### [System Code] ([Region])` sub-headings. |
| V.7 | `SYSTEM` values are never fabricated by the LLM; `LLM-GENERATED` narrative must be grounded in source change data. |
| V.8 | Provenance tags (`[SYSTEM]`, `[LLM-GENERATED]`, `[AUTHOR]`) must be stripped from the output. |
| V.9 | The Systems Updated table must contain at least one system row. |
| V.10 | The footer must include the Parent topic line and the standard disclaimer with the correct year. |
| V.11 | When large lists are condensed, a note pointing to a coverage reference must be included. |
