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
| `reference.dtd` | Local DTD subset for the `reference` topics |
| `map.dtd` | Local DTD subset for the ditamaps |

Each topic declares the OASIS DITA 1.3 `reference` public identifier; the maps
declare the `map` public identifier. All files are well-formed XML **and** pass
DTD validation against the bundled local DTDs.

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

## DTDs

`reference.dtd` and `map.dtd` are **local subset DTDs** — not the full OASIS
DITA 1.3 grammar. They declare exactly the elements and attributes used by the
documents in this directory so the files can be validated standalone, without
downloading the official DITA DTD set or configuring an XML catalog. The
`SYSTEM` identifier in each document's `DOCTYPE` (`"reference.dtd"` /
`"map.dtd"`) resolves to these local files.

In a production DITA toolchain, map the OASIS public identifiers
(`-//OASIS//DTD DITA Reference//EN`, `-//OASIS//DTD DITA Map//EN`) to the
official grammar via an XML catalog; that grammar is a superset of what the
local subset declares, so these documents remain valid against it.

## Validation

All four documents pass DTD validation against the bundled local DTDs:

```
xmllint --noout --valid dita/sut-release-note-26.6.1.0.dita
xmllint --noout --valid dita/vat-international-release-note-26.6.1.0.dita
xmllint --noout --valid dita/avatax-sut-rn.ditamap
xmllint --noout --valid dita/avatax-vat-rn.ditamap
```
