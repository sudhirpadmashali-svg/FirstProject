/**
 * Section builders for the "Cross-Border" release notes.
 *
 * Cross-Border is structurally different from the SUT/VAT content types: it is
 * organized around content *systems* (HTS taxonomies / regions), not a nested
 * jurisdiction tree. Rather than force system data through the tree renderers,
 * these builders read a flat, system-oriented data model (see
 * data/cb-sample.json). Headings and prompt text are copied verbatim from
 * CrossBorder_ReleaseNote_Template_forAutomation.docx.
 *
 * The document shell (title/intro/meta/footer) and the generic
 * "Supporting Resources" section are shared with SUT/VAT and are not
 * reimplemented here.
 */
const { esc, entityFieldRow, fieldRow } = require("./format");
const { sectionWrap, overviewLine, noChanges } = require("./sections");

/** "Systems Updated" — table of {code, name, region, effectiveDate}. */
function buildSystemsTable(config, systems = []) {
  const rows = (systems || []).filter((s) => s.effectiveDate);
  const tableRows = rows
    .map(
      (s) =>
        `<tr><td>${esc(s.code)}</td><td>${esc(
          s.region ? `${s.name} / ${s.region}` : s.name
        )}</td><td>${esc(s.effectiveDate)}</td></tr>`
    )
    .join("\n");

  const table = rows.length
    ? `<table class="juris-table">
  <tr><th>System Code</th><th>System Name / Region</th><th>Effective Date</th></tr>
  ${tableRows}
</table>`
    : noChanges(config.systemsTable.noChangesText);

  return sectionWrap(config.systemsTable.heading, overviewLine(config.systemsTable.overview) + table);
}

/**
 * "Changes to De Minimis Rules" — bullet list, one line per jurisdiction:
 *   "United Kingdom — updated to £135 (from £0)".
 * Data: [{ jurisdiction, newThreshold, priorThreshold?, detail? }]
 */
function buildDeMinimisSection(sectionConfig, entries = []) {
  if (!entries || entries.length === 0) {
    return sectionWrap(sectionConfig.heading, noChanges(sectionConfig.noChangesText));
  }
  const items = entries
    .map((e) => {
      if (e.detail) return `<li>${esc(`${e.jurisdiction} — ${e.detail}`)}</li>`;
      const from = e.priorThreshold ? ` (from ${e.priorThreshold})` : "";
      return `<li>${esc(`${e.jurisdiction} — updated to ${e.newThreshold}${from}`)}</li>`;
    })
    .join("\n");
  return sectionWrap(sectionConfig.heading, `<ul class="bullet-list">${items}</ul>`);
}

/**
 * "Changes to HS Taxonomy" — one flat card per system with Additions/Deletions.
 * Data: [{ systemCode, region?, additions?: string[], deletions?: string[] }]
 */
function buildHsTaxonomySection(sectionConfig, entries = []) {
  if (!entries || entries.length === 0) {
    return sectionWrap(sectionConfig.heading, noChanges(sectionConfig.noChangesText));
  }
  const cards = entries
    .map(
      (e) => `<div class="flat-card">
  <div class="flat-header">${esc(e.region ? `${e.systemCode} (${e.region})` : e.systemCode)}</div>
  <div class="flat-body">
    ${entityFieldRow("Additions", e.additions)}
    ${fieldRow("Deletions", (e.deletions && e.deletions.length) ? e.deletions.join("; ") : "none")}
  </div>
</div>`
    )
    .join("\n");
  return sectionWrap(sectionConfig.heading, cards);
}

/** "Changes to Customs Valuation Approaches" — free text, or the "No changes." fallback. */
function buildCustomsValuationSection(sectionConfig, text) {
  return sectionWrap(sectionConfig.heading, noChanges(text || sectionConfig.noChangesText));
}

/**
 * "Updated Cross-Border Content" — one flat card per system with MFN /
 * preferential rate changes.
 * Data: [{ systemCode, region?, mfnChanges?: string[], preferentialChanges?: string[] }]
 */
function buildCrossBorderContentSection(sectionConfig, entries = []) {
  if (!entries || entries.length === 0) {
    return sectionWrap(sectionConfig.heading, noChanges(sectionConfig.noChangesText));
  }
  const cards = entries
    .map(
      (e) => `<div class="flat-card">
  <div class="flat-header">${esc(e.region ? `${e.systemCode} (${e.region})` : e.systemCode)}</div>
  <div class="flat-body">
    ${fieldRow("MFN changes", (e.mfnChanges && e.mfnChanges.length) ? e.mfnChanges.join("; ") : "none")}
    ${fieldRow("Preferential changes", (e.preferentialChanges && e.preferentialChanges.length) ? e.preferentialChanges.join("; ") : "none")}
  </div>
</div>`
    )
    .join("\n");
  return sectionWrap(sectionConfig.heading, overviewLine(sectionConfig.overview) + cards);
}

/** "New Cross-Border Content Added" — free text supplied directly in data. */
function buildNewContentSection(config, data) {
  const text = data.newContent || config.newContentSection.noChangesText;
  return sectionWrap(config.newContentSection.heading, noChanges(text));
}

/**
 * Assemble the ordered body sections for a Cross-Border document, in the exact
 * order CrossBorder_ReleaseNote_Template_forAutomation.docx specifies. Each
 * categorySection is dispatched by its `render` mode.
 */
function buildCrossBorderSections(config, data, buildResourcesSection) {
  const categoryRenderers = {
    deMinimisList: buildDeMinimisSection,
    systemAddDelete: buildHsTaxonomySection,
    freeText: buildCustomsValuationSection,
    systemMfnPreferential: buildCrossBorderContentSection,
  };

  const categoryHtml = config.categorySections.map((sc) => {
    const render = categoryRenderers[sc.render];
    if (!render) throw new Error(`Unknown Cross-Border render mode: ${sc.render}`);
    return render(sc, data[sc.key]);
  });

  return [
    buildSystemsTable(config, data.systems),
    ...categoryHtml,
    buildNewContentSection(config, data),
    buildResourcesSection(config, data),
  ];
}

module.exports = {
  buildSystemsTable,
  buildDeMinimisSection,
  buildHsTaxonomySection,
  buildCustomsValuationSection,
  buildCrossBorderContentSection,
  buildNewContentSection,
  buildCrossBorderSections,
};
