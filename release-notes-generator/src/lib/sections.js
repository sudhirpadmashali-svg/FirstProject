const { esc } = require("./format");
const { renderJurisdictionTree } = require("./renderTree");
const { renderFlatCards } = require("./renderFlatCards");
const {
  collectJurisdictionsUpdated,
  collectChangesByCategory,
  pruneTreeByCategory,
  collectTaxCodeSummaries,
} = require("./flatten");

function sectionWrap(heading, bodyHtml) {
  return `<h2 class="section-heading">${esc(heading)}</h2>\n${bodyHtml}`;
}

function overviewLine(text) {
  return `<div class="overview"><span class="label">Overview:</span> ${esc(text)}</div>`;
}

function whatChangedLine(text) {
  return `<div class="overview"><span class="label">What changed:</span> ${esc(text)}</div>`;
}

function noChanges(text) {
  return `<div class="no-changes">${esc(text)}</div>`;
}

/** "Jurisdictions Updated" — flattens the tree into a summary table. */
function buildJurisdictionsTable(config, tree) {
  const rows = collectJurisdictionsUpdated(tree).filter((r) => r.effectiveDate);
  const tableRows = rows
    .map(
      (r) =>
        `<tr><td>${esc(r.code || r.path)}</td><td>${esc(r.name + (r.level ? ` / ${r.level}` : ""))}</td><td>${esc(
          r.effectiveDate
        )}</td></tr>`
    )
    .join("\n");

  const table = rows.length
    ? `<table class="juris-table">
  <tr><th>Jurisdiction Code</th><th>Jurisdiction Name / Level</th><th>Effective Date</th></tr>
  ${tableRows}
</table>`
    : noChanges("No jurisdiction content updates in this release.");

  return sectionWrap(config.jurisdictionTable.heading, overviewLine(config.jurisdictionTable.overview) + table);
}

/** Human-readable ancestor path used as the flat-card header, e.g. "Bloomington, Minnesota (City) — Hennepin County". */
function displayLabel(node, ancestors) {
  if (node.displayLabel) return node.displayLabel;
  const trail = [...ancestors].reverse().join(" — ");
  const withLevel = node.level ? `${node.name} (${node.level})` : node.name;
  return trail ? `${withLevel} — ${trail}` : withLevel;
}

/** One "Changes to X" section, dispatched by config.render: bulletList | hierarchy | flatCards. */
function buildCategorySection(sectionConfig, tree) {
  const matches = collectChangesByCategory(tree, sectionConfig.category);

  if (matches.length === 0) {
    return sectionWrap(sectionConfig.heading, noChanges(sectionConfig.noChangesText));
  }

  if (sectionConfig.render === "bulletList") {
    const items = matches
      .map(({ change }) => `<li>${esc(change.bulletText || change.title)}</li>`)
      .join("\n");
    return sectionWrap(sectionConfig.heading, `<ul class="bullet-list">${items}</ul>`);
  }

  if (sectionConfig.render === "hierarchy") {
    const pruned = pruneTreeByCategory(tree, sectionConfig.category);
    return sectionWrap(sectionConfig.heading, renderJurisdictionTree(pruned));
  }

  if (sectionConfig.render === "flatCards") {
    // Build one flat card per node that has a matching change, grouping that
    // node's tax types/changes for this category only.
    const byNode = new Map();
    for (const { node, ancestors, taxType, change } of matches) {
      const key = node;
      if (!byNode.has(key)) {
        byNode.set(key, { name: displayLabel(node, ancestors), taxTypes: new Map() });
      }
      const entry = byNode.get(key);
      if (!entry.taxTypes.has(taxType.name)) entry.taxTypes.set(taxType.name, []);
      entry.taxTypes.get(taxType.name).push(change);
    }
    const cardNodes = [...byNode.values()].map((entry) => ({
      name: entry.name,
      taxTypes: [...entry.taxTypes.entries()].map(([name, changes]) => ({ name, changes })),
    }));
    return sectionWrap(sectionConfig.heading, renderFlatCards(cardNodes, { bare: true }));
  }

  throw new Error(`Unknown render mode: ${sectionConfig.render}`);
}

/** "Updated Tax Codes" — aggregated across every change in the tree, regardless of category. */
function buildTaxCodesSection(config, tree) {
  const summaries = collectTaxCodeSummaries(tree);
  if (summaries.length === 0) {
    return sectionWrap(config.taxCodesSection.heading, noChanges(config.taxCodesSection.noChangesText));
  }
  const cards = summaries
    .map(
      (s) => `<div class="flat-card">
  <div class="flat-header">${esc(s.path)}</div>
  <div class="flat-body">
    ${s.additions.length ? `<div class="field-row"><span class="field-label">Additions:</span><span class="field-value">${esc(s.additions.join("; "))}</span></div>` : ""}
    <div class="field-row"><span class="field-label">Deletions:</span><span class="field-value">${esc(s.deletions.length ? s.deletions.join("; ") : "none")}</span></div>
  </div>
</div>`
    )
    .join("\n");
  return sectionWrap(config.taxCodesSection.heading, overviewLine(config.taxCodesSection.overview) + cards);
}

/** "New Jurisdictions or Tax Types / VAT Regimes Added" — free-text, supplied directly in data. */
function buildNewJurisdictionsSection(config, data) {
  const text = data.newJurisdictions || config.newJurisdictionsSection.noChangesText;
  return sectionWrap(config.newJurisdictionsSection.heading, noChanges(text));
}

/** "Supporting Resources" — list of {label, url} supplied in data. */
function buildResourcesSection(config, data) {
  const links = data.resources || [];
  const body = links.length
    ? `<ul class="bullet-list">${links
        .map((r) => `<li><a href="${esc(r.url)}">${esc(r.label)}</a></li>`)
        .join("\n")}</ul>`
    : noChanges("No supporting resources linked for this release.");
  return sectionWrap(config.resourcesSection.heading, body);
}

module.exports = {
  buildJurisdictionsTable,
  buildCategorySection,
  buildTaxCodesSection,
  buildNewJurisdictionsSection,
  buildResourcesSection,
  whatChangedLine,
};
