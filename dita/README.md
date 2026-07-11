# DITA Release Note Snippets

DITA-compliant XML generated from the AvaTax release-note preview samples and
the "for Automation" Word templates (Template Version 4.0).

## Files

| File | Purpose |
| --- | --- |
| `sut-release-note-26.6.1.0.dita` | Sales &amp; Use Tax release note (`reference` topic) |
| `vat-international-release-note-26.6.1.0.dita` | VAT International release note (`reference` topic) |
| `avatax-sut-rn.ditamap` | Map for the SUT topic (`DITA Map ID: AVATAX_SUT_RN_MAP`) |
| `avatax-vat-rn.ditamap` | Map for the VAT topic (`DITA Map ID: AVATAX_VAT_RN_MAP`) |

Each topic uses the OASIS DITA 1.3 `reference` DTD; the maps use the `map` DTD.
All files are well-formed XML.

## How the template maps to DITA

| Template / preview element | DITA representation |
| --- | --- |
| `[INTERNAL] Document Metadata Block` (Template Version, Product, Release Version, DITA Map ID, Approval/Publication status, etc.) | `<prolog>` &rarr; `<metadata><othermeta>`, plus `<critdates>`, `<author>`, `<copyright>` |
| Document title / intro | `<title>` and `<shortdesc>` |
| "Detailed Changes by Jurisdiction" (sole primary section) | `<section>` with `<title>`; overview as `<p outputclass="overview">` |
| Jurisdiction hierarchy (Country &gt; State &gt; County &gt; City / Bloc &gt; Member State) | Nested `<div>` blocks with `outputclass` mirroring the preview CSS classes (`country`, `state`, `county`, `city`, `country-card`) — DITA `<section>` cannot nest, so `<div>` carries the hierarchy |
| Tax Type card + Change card | `<div outputclass="taxtype-card">` &rarr; `<div outputclass="change-card">` |
| Field rows (Citation, Effective, Description, Impact, Tax Codes) | `<dl>` / `<dlentry>` (`<dt>`/`<dd>`) |
| Action Required callout | `<note type="attention" outputclass="action-required">` |
| Pattern B "Bulk Update" grid | CALS `<table>` with `<tgroup>`, `<thead>`, `<tbody>` |
| Change tag / internal-only fields (e.g. Contributing Change Sets, `suppress=true`) | `audience="internal"` conditional attribute so they can be filtered out at publish time |
| Supporting Resources links | `<section>` &rarr; `<ul>` of `<xref scope="external">` |
| Parent topic | `<related-links>` &rarr; `<link>` to the map |

## Validation

Well-formedness was checked with an XML parser. For full DTD/schema validation
run against the OASIS DITA 1.3 DTDs, e.g.:

```
xmllint --noout --valid dita/sut-release-note-26.6.1.0.dita
```

(Requires the DITA DTDs to be resolvable locally or via an XML catalog.)
