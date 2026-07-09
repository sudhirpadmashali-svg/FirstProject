# Release Notes HTML Generator

Generates Knowledge Center–ready HTML release notes for the two custom content
types — **US Indirect Taxes (SUT)** and **International VAT** — from structured
JSON content-diff data, following the section structure defined in:

- `SUT_ReleaseNote_Template_forAutomation.docx`
- `VATInternational_ReleaseNote_Template_forAutomation.docx`

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
npm run generate:all   # both
```

Or directly:

```
node src/generate.js --type sut --input data/sut-sample.json --output output/sut.html
node src/generate.js --type vat --input data/vat-sample.json --output output/vat.html
```

## How a document is assembled

`src/lib/buildDocument.js` lays out the page in the exact order the docx
templates specify:

1. Title, release date, intro paragraph (from the content-type config)
2. Meta row (Window/Generated for SUT; Release Window/Content Type/Generated for VAT)
3. `Release Note [Version] ([Month Year])` heading
4. **Jurisdictions Updated** — table, built by flattening every dated node in the tree
5. One section per template-defined change category (e.g. *Changes to Tax
   Rates*, *Changes to Economic Nexus Thresholds*, *Changes to Taxability
   Rules* for SUT; the VAT equivalents for VAT) — each falls back to the
   template's own "No changes..." text when there's nothing to show
6. **Updated Tax Codes** — aggregated from every change's `taxCodes` block, regardless of category
7. **New Jurisdictions or Tax Types/VAT Regimes Added**
8. **Supporting Resources**
9. Parent topic + standard disclaimer footer

The `[INTERNAL] Document Metadata Block` at the top of both `.docx` files is
intentionally **not** reproduced here — it's marked "do not publish" in the
templates, so it's automation/workflow metadata only (approval status, DITA
map ID, etc.), not part of the published article.

## Content-type configuration

`src/config/sut.config.js` and `src/config/vat.config.js` hold everything
that differs between the two content types: heading text, meta field labels,
and — importantly — `hierarchyStyle`:

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

## File map

```
src/
  generate.js              CLI entry point
  styles.css                shared stylesheet (both content types)
  config/
    sut.config.js           SUT section headings, prompt text, hierarchyStyle
    vat.config.js           VAT section headings, prompt text, hierarchyStyle
  lib/
    format.js                HTML-escaping + small field formatters
    renderChangeCard.js       renders one Change record (title/citation/fields/action-required/tax-code footer)
    renderTree.js             recursive Country>State>County>City renderer
    renderFlatCards.js        flat single-card-per-jurisdiction renderer
    flatten.js                tree-walking helpers (jurisdictions table, category grouping, tax-code aggregation)
    sections.js               builds each named section from config + tree
    buildDocument.js          assembles the full HTML page
data/
  sut-sample.json           transcribed from US_Indirect_Taxes_Release_Notes.pdf
  vat-sample.json           transcribed from International_VAT_Release_Notes.pdf
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
