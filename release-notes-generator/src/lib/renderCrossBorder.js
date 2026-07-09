const { esc } = require("./format");

function sectionWrap(heading, bodyHtml) {
  return `<h2>${esc(heading)}</h2>\n${bodyHtml}`;
}
function noChanges(text) {
  return `<p class="no-changes">${esc(text)}</p>`;
}
function field(label, value) {
  if (!value) return "";
  return `<div class="field"><span class="label">${esc(label)}:</span> ${esc(value)}</div>`;
}

/** "Systems Updated" table: Code | Name/Region | Effective Date. */
function buildSystemsTable(config, data) {
  const systems = data.systems || [];
  const rows = systems
    .map((s) => `<tr><td>${esc(s.code)}</td><td>${esc(s.name)}</td><td>${esc(s.effectiveDate)}</td></tr>`)
    .join("\n");
  const table = systems.length
    ? `<table>
  <tr><th>System Code</th><th>System Name / Region</th><th>Effective Date</th></tr>
  ${rows}
</table>`
    : noChanges("No systems refreshed in this release.");
  return sectionWrap(config.systemsTable.heading, `<p>${esc(config.systemsTable.overview)}</p>${table}`);
}

/**
 * "Changes to De Minimis Rules": one .change-block per entry, each with
 * Jurisdiction / Update / Effective From / Impact fields (all optional except
 * jurisdiction+update). Falls back to the template's "No changes" text.
 */
function buildDeMinimisSection(config, data) {
  const entries = data.deMinimis || [];
  if (entries.length === 0) {
    return sectionWrap(config.deMinimisSection.heading, noChanges(config.deMinimisSection.noChangesText));
  }
  const blocks = entries
    .map(
      (e) => `<div class="change-block">
  ${field("Jurisdiction", e.jurisdiction)}
  ${field("Update", e.update)}
  ${field("Effective From", e.effectiveFrom)}
  ${field("Impact", e.impact)}
</div>`
    )
    .join("\n");
  return sectionWrap(config.deMinimisSection.heading, blocks);
}

/**
 * "Changes to HS Taxonomy": one <h3> sub-heading per system, each with
 * Additions / Deletions fields.
 */
function buildHsTaxonomySection(config, data) {
  const systems = data.hsTaxonomy || [];
  if (systems.length === 0) {
    return sectionWrap(config.hsTaxonomySection.heading, noChanges(config.hsTaxonomySection.noChangesText));
  }
  const body = systems
    .map(
      (s) => `<h3>${esc(s.systemCode)} (${esc(s.region)})</h3>
${field("Additions", s.additions || "none")}
${field("Deletions", s.deletions || "none")}`
    )
    .join("\n");
  return sectionWrap(config.hsTaxonomySection.heading, body);
}

/** "Changes to Customs Valuation Approaches": free narrative text, or "No changes." */
function buildCustomsValuationSection(config, data) {
  const text = data.customsValuation || config.customsValuationSection.noChangesText;
  return sectionWrap(config.customsValuationSection.heading, `<p>${esc(text)}</p>`);
}

/**
 * "Updated Cross-Border Content": one <h3> sub-heading per system, each with
 * MFN changes / Preferential changes fields.
 */
function buildUpdatedContentSection(config, data) {
  const systems = data.updatedContent || [];
  if (systems.length === 0) {
    return sectionWrap(config.updatedContentSection.heading, noChanges(config.updatedContentSection.noChangesText));
  }
  const body = systems
    .map(
      (s) => `<h3>${esc(s.systemCode)} (${esc(s.region)})</h3>
${field("MFN changes", s.mfnChanges || "none")}
${field("Preferential changes", s.preferentialChanges || "none")}`
    )
    .join("\n");
  return sectionWrap(config.updatedContentSection.heading, `<p>${esc(config.updatedContentSection.overview)}</p>${body}`);
}

/** "New Cross-Border Content Added": free text, or "No changes." */
function buildNewContentSection(config, data) {
  const text = data.newContent || config.newContentSection.noChangesText;
  return sectionWrap(config.newContentSection.heading, `<p>${esc(text)}</p>`);
}

/** "Supporting Resources": bullet list of {label, url}. */
function buildResourcesSection(config, data) {
  const links = data.resources || [];
  const body = links.length
    ? `<ul>${links.map((r) => `<li><a href="${esc(r.url)}">${esc(r.label)}</a></li>`).join("\n")}</ul>`
    : noChanges("No supporting resources linked for this release.");
  return sectionWrap(config.resourcesSection.heading, body);
}

module.exports = {
  buildSystemsTable,
  buildDeMinimisSection,
  buildHsTaxonomySection,
  buildCustomsValuationSection,
  buildUpdatedContentSection,
  buildNewContentSection,
  buildResourcesSection,
};
