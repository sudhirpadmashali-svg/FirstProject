# AvaTax Release Notes — DITA XML

DITA-compliant XML for the three AvaTax release-note products. Each product folder
contains a reusable **template** (structure + placeholders, mirroring the
`*_ReleaseNote_Template_forAutomation.docx` files), a **populated sample** (the same
structure filled with the content from the `*_ReleaseNote_Preview*.html` samples), and a
**DITA map** tying them together.

## Layout

```
dita/
├── sut/                         Sales & Use Tax  (map id AVATAX_SUT_RN_MAP)
│   ├── avatax-sut-releasenote-template.dita
│   ├── avatax-sut-releasenote-202606.dita
│   └── avatax_sut_rn_map.ditamap
├── vat-international/            VAT International (map id AVATAX_VAT_RN_MAP)
│   ├── avatax-vat-releasenote-template.dita
│   ├── avatax-vat-releasenote-202606.dita
│   └── avatax_vat_rn_map.ditamap
└── cross-border/                Cross-Border     (map id AVATAX_XB_RN_MAP)
    ├── avatax-xb-releasenote-template.dita
    ├── avatax-xb-releasenote-202606.dita
    └── avatax_xb_rn_map.ditamap
```

## DITA modeling decisions

- **Topic type:** each release note is a `<reference>` topic — the content is factual
  reference material (jurisdiction codes, rate/threshold values, tax-code lists).
- **Document metadata block** (the `[INTERNAL]` automation anchor in the docx) maps to
  `<prolog>`: `[SYSTEM]` fields become `<othermeta>`, product/version become
  `<prodinfo>`/`<vrmlist>`, and release/updated dates become `<critdates>`.
- **Title / intro** → `<title>` and `<shortdesc>`.
- **Sections** ("Jurisdictions Updated", "Changes to …", etc.) → `<section>` with a `<title>`.
- **Jurisdiction / system tables** → CALS `<table>` with a `<tgroup>`.
- **Per-change field lists** (Tax Type, Change Title, Citations, Effective, Additions,
  Updates, Deletions, Summary, Impact, …) → `<dl>`/`<dlentry>`.
- **Action Required** → `<note type="attention">`.
- **Supporting Resources** → `<ul>` of `<xref>`.
- **Parent topic** is expressed structurally via the `.ditamap` and a `<related-links>` link.

Placeholder provenance from the templates is preserved in the template topics:
`[SYSTEM]` (automation/Jira), `[LLM-GENERATED]` (model-drafted), `[AUTHOR]` (human-curated).

## Validation

All files are well-formed XML. To validate against the OASIS DITA 1.3 DTDs (referenced in
each file's `DOCTYPE`) or to publish, run them through DITA Open Toolkit, e.g.:

```
dita -i dita/sut/avatax_sut_rn_map.ditamap -f html5 -o out/sut
```
