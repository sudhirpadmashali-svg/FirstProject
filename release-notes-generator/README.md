# Release Notes HTML Generator

Generates Knowledge Center–ready HTML release notes for the three custom content
types — **US Indirect Taxes (SUT)**, **International VAT**, and **Cross-Border** —
from structured JSON content-diff data, following the section structure defined in:

- `SUT_ReleaseNote_Template_forAutomation.docx`
- `VATInternational_ReleaseNote_Template_forAutomation.docx`
- `CrossBorder_ReleaseNote_Template_forAutomation.docx`

and matching the visual design of the production sample outputs:

- `US_Indirect_Taxes_Release_Notes.pdf` (nested jurisdiction tree)
- `International_VAT_Release_Notes.pdf` (flat jurisdiction card)

This is plain Node.js with **no external dependencies** — everything is a
small, readable template function so it can be dropped into an existing
automation pipeline (e.g. called after the LLM-generation step that fills in
Summary/Impact/Citations from the source legal text) without adding a new
templating engine to the stack.

## Quick start

```
npm run generate:sut   # -> output/sut.html
npm run generate:vat   # -> output/vat.html
npm run generate:cb    # -> output/cb.html  (Cross-Border)
npm run generate:all   # all three
```

Or directly:

```
node src/generate.js --type sut --input data/sut-sample.json --output output/sut.html
node src/generate.js --type vat --input data/vat-sample.json --output output/vat.html
node src/generate.js --type cb  --input data/cb-sample.json  --output output/cb.html
```

## How a document is assembled

`src/lib/buildDocument.js` lays out the page in the exact order the docx
templates specify. All three content types share the same document shell
(title / release date / intro / meta row / `Release Note [Version]` heading /
footer); they differ in the **document model** used for the body:

- **`tree`** (SUT, VAT) — changes live inside a nested jurisdiction tree
  (`data.tree`); body built by `src/lib/sections.js`:
  1. **Jurisdictions Updated** — table, built by flattening every dated node in the tree
  2. One section per template-defined change category (e.g. *Changes to Tax
     Rates*, *Changes to Economic Nexus Thresholds*, *Changes to Taxability
     Rules* for SUT; the VAT equivalents for VAT)
  3. **Updated Tax Codes** — aggregated from every change's `taxCodes` block, regardless of category
  4. **New Jurisdictions or Tax Types/VAT Regimes Added**
  5. **Supporting Resources**

- **`systems`** (Cross-Border) — content is organized around content *systems*
  (HTS taxonomies / regions), not a jurisdiction tree; body built by
  `src/lib/sectionsCrossBorder.js`:
  1. **Systems Updated** — table of {System Code, System Name / Region, Effective Date}
  2. **Changes to De Minimis Rules** — bullet list, one line per jurisdiction
  3. **Changes to HS Taxonomy** — one card per system with added / deleted HS chapters
  4. **Changes to Customs Valuation Approaches** — free text
  5. **Updated Cross-Border Content** — one card per system with MFN / preferential changes
  6. **New Cross-Border Content Added**
  7. **Supporting Resources**

Every section falls back to the template's own "No changes..." text when there's
nothing to show. `buildDocument` branches on `config.documentModel` (`"systems"`
for Cross-Border, tree otherwise), then wraps the body in the shared shell.

The `[INTERNAL] Document Metadata Block` at the top of all three `.docx` files is
intentionally **not** reproduced here — it's marked "do not publish" in the
templates, so it's automation/workflow metadata only (approval status, DITA
map ID, etc.), not part of the published article.

## Content-type configuration

`src/config/*.config.js` hold everything that differs between content types:
heading text, meta field labels, and (for the tree model) `hierarchyStyle`.

The **Cross-Border** config (`src/config/cb.config.js`) sets
`documentModel: "systems"` and lists its `categorySections` with a `render`
mode each — `deMinimisList`, `systemAddDelete`, `freeText`, or
`systemMfnPreferential` — plus the `key` naming the top-level data field that
section reads. No jurisdiction tree is involved; see the data schema below.

For the tree model, `sut.config.js` and `vat.config.js` differ mainly in
`hierarchyStyle`:

- `"tree"` (SUT): nested `Country > State > County > City` guide-line layout
- `"card"` (VAT): flat, single bordered card per jurisdiction

Both content types share the same section-building logic
(`src/lib/sections.js`); only the visual container differs
(`renderTree.js` vs `renderFlatCards.js`), because VAT jurisdictions in the
current data are country-level only. If a future release needs sub-national
VAT jurisdictions (e.g. Canadian federal/provincial GST/PST), switch
`hierarchyStyle` to `"tree"` in `vat.config.js` — no other code changes needed.

## Data schema (`data/*.json`)

Each file is one `tree` of jurisdiction nodes plus document-level metadata:

```jsonc
{
  "releaseVersion": "26.6.1.0",
  "releaseMonthYear": "June 2026",
  "window": "2026-06-01 — 2026-06-30",
  "generated": "2026-06-30",
  "newJurisdictions": null,        // string, or null to use the template's "No changes" fallback
  "resources": [{ "label": "...", "url": "..." }],
  "tree": [
    {
      "code": "US-MN-HENNEPIN-MPLS",
      "name": "Minneapolis",
      "level": "City",
      "effectiveDate": "2026-07-01",   // drives the Jurisdictions Updated table
      "children": [ /* nested jurisdiction nodes, same shape */ ],
      "taxTypes": [
        {
          "name": "Sales Tax",
          "changes": [
            {
              "title": "...",
              "category": "rate",       // routes this change to the matching config section
              "citations": ["..."],
              "effectiveFrom": "2026-07-01",
              "effectiveTo": null,
              "rates": { "additions": ["..."], "updations": [], "deletions": [] },
              "taxability": { "updations": ["..."] },
              "nexus": { "additions": [], "updations": [], "deletions": [] },
              "taxCodes": { "additions": ["..."], "deletions": [] },
              "summary": "...",
              "impact": "...",
              "actionRequired": "..."   // renders as the orange callout; omit if none
            }
          ]
        }
      ]
    }
  ]
}
```

This mirrors the `Release_Notes_XML_Schema` element structure
(`ContentReleaseNotes > Jurisdictions > Jurisdiction > TaxTypes > TaxType >
Changes > Change`, with the `Rates` / `TaxabilityDecisions` / `TaxCodes` /
`Nexus` entity-change blocks) — this generator is effectively a JSON
transcription of that XML plus a `category` field per change telling the
renderer which docx-template section that change belongs to.

**`category` values currently wired up:**

| Content type | category value        | Renders in section                         |
|---|---|---|
| SUT | `nexus`                | Changes to Economic Nexus Thresholds       |
| SUT | `rate`                 | Changes to Tax Rates                        |
| SUT | `taxability`            | Changes to Taxability Rules                 |
| VAT | `registrationThreshold` | Changes to VAT Registration Thresholds      |
| VAT | `rate`                 | Changes to VAT Rates                        |
| VAT | `taxability`            | Changes to Taxability and Exemption Rules   |

A `taxCodes` block on any change is picked up automatically for the
**Updated Tax Codes** section regardless of that change's `category`.

## Cross-Border data schema (`data/cb-sample.json`)

Cross-Border uses the `systems` model instead of a `tree`: document-level
metadata plus one flat array per template section. Each `key` matches a
`categorySections` entry in `cb.config.js`.

```jsonc
{
  "releaseVersion": "26.6.1.0",
  "releaseMonthYear": "June 2026",
  "window": "2026-05-01 to 2026-05-31",
  "contentSyncDate": "2026-05-28",
  "generated": "2026-06-30",
  "newContent": null,              // string, or null to use the "No changes" fallback
  "systems": [                     // -> Systems Updated table (only rows with effectiveDate shown)
    { "code": "HTS A", "name": "United States", "region": "North America", "effectiveDate": "12 Jun 2026" }
  ],
  "deMinimis": [                   // -> Changes to De Minimis Rules
    { "jurisdiction": "United Kingdom", "newThreshold": "£135", "priorThreshold": "£0" },
    { "jurisdiction": "Brazil", "detail": "de minimis exemption removed" }  // free-form line
  ],
  "hsTaxonomy": [                  // -> Changes to HS Taxonomy (one card per system)
    { "systemCode": "HTS A", "region": "United States", "additions": ["07 (Edible vegetables)"], "deletions": [] }
  ],
  "customsValuation": "…",         // -> Changes to Customs Valuation Approaches (free text, or null)
  "crossBorderContent": [          // -> Updated Cross-Border Content (one card per system)
    { "systemCode": "HTS A", "region": "United States", "mfnChanges": ["Chapters 07, 08"], "preferentialChanges": ["USMCA partners …"] }
  ],
  "resources": [{ "label": "…", "url": "…" }]
}
```

## File map

```
src/
  generate.js              CLI entry point
  styles.css                shared stylesheet (both content types)
  config/
    sut.config.js           SUT section headings, prompt text, hierarchyStyle
    vat.config.js           VAT section headings, prompt text, hierarchyStyle
    cb.config.js            Cross-Border headings, prompt text, systems model + render modes
  lib/
    format.js                HTML-escaping + small field formatters
    renderChangeCard.js       renders one Change record (title/citation/fields/action-required/tax-code footer)
    renderTree.js             recursive Country>State>County>City renderer
    renderFlatCards.js        flat single-card-per-jurisdiction renderer
    flatten.js                tree-walking helpers (jurisdictions table, category grouping, tax-code aggregation)
    sections.js               builds each tree-model section from config + tree
    sectionsCrossBorder.js    builds each Cross-Border (systems-model) section from config + data
    buildDocument.js          assembles the full HTML page (branches on documentModel)
data/
  sut-sample.json           transcribed from US_Indirect_Taxes_Release_Notes.pdf
  vat-sample.json           transcribed from International_VAT_Release_Notes.pdf
  cb-sample.json            Cross-Border sample (systems model), per the CrossBorder docx template
output/                     generated HTML lands here (gitignored)
```

## Known judgment calls / things to confirm with the content team

- The Bloomington "Mall of America Admissions Tax Adjustment" (base
  adjustment, not a rate change) was categorized `taxability`, not `rate`.
- The EU "Domestic VAT Out-of-Scope Expansion" (a scope change) was
  categorized `taxability`, not `rate`, under VAT.
- Jurisdictions without an `effectiveDate` (e.g. Bloomington in the sample)
  are omitted from the **Jurisdictions Updated** table rather than shown with
  a placeholder dash — confirm this is the desired behavior.
- `Citations`, `Summary`, `Impact`, and `bulletText` are plain strings here;
  if your automation's LLM-generation step produces these per the docx
  template's `— LLM-GENERATED` / `— AUTHOR if applicable` prompts, that step
  should run *before* this generator and populate these JSON fields.
