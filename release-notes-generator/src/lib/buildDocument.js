const fs = require("fs");
const path = require("path");
const { esc } = require("./format");
const {
  buildJurisdictionsTable,
  buildCategorySection,
  buildTaxCodesSection,
  buildNewJurisdictionsSection,
  buildResourcesSection,
} = require("./sections");
const { buildCrossBorderSections } = require("./sectionsCrossBorder");

const CSS = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

function metaRow(config, data) {
  const cells = config.metaFields
    .map((f) => `<div><span class="label">${esc(f.label)}:</span><span class="value">${esc(data[f.key] || "")}</span></div>`)
    .join("\n");
  return `<div class="meta-row">${cells}</div>`;
}

/**
 * Ordered body sections for the tree-based content types (SUT / VAT), whose
 * changes live inside a nested jurisdiction tree (data.tree).
 */
function buildTreeSections(config, data) {
  return [
    buildJurisdictionsTable(config, data.tree),
    ...config.categorySections.map((sc) => buildCategorySection(sc, data.tree)),
    buildTaxCodesSection(config, data.tree),
    buildNewJurisdictionsSection(config, data),
    buildResourcesSection(config, data),
  ];
}

/**
 * Build the full release-note HTML document for a given content type.
 * @param {object} config  One of config/sut.config.js, vat.config.js, cb.config.js
 * @param {object} data    See data/*-sample.json for the shape each model expects
 */
function buildDocument(config, data) {
  // Two document models: the SUT/VAT "tree" model (nested jurisdictions), and
  // the Cross-Border "systems" model (flat, system-oriented content).
  const sections = (
    config.documentModel === "systems"
      ? buildCrossBorderSections(config, data, buildResourcesSection)
      : buildTreeSections(config, data)
  ).join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(config.docTitle)}</title>
<style>
${CSS}
</style>
</head>
<body>

<h1 class="doc-title">${esc(config.docTitle)}</h1>
<div class="release-date">${esc(data.releaseMonthYear)}</div>
<div class="intro"><p>${esc(config.intro)}</p></div>
${metaRow(config, data)}
<hr class="divider-thick">

<h2 class="release-heading">Release Note ${esc(data.releaseVersion)} (${esc(data.releaseMonthYear)})</h2>

${sections}

<p class="parent-topic">Parent topic: ${esc(config.parentTopic)}</p>
<p class="disclaimer">Avalara regularly updates Knowledge Center content and this document may be out of date. Please check back frequently for updates. &copy; Avalara Inc. ${esc(
    data.copyrightYear || new Date(data.generated || Date.now()).getFullYear()
  )}</p>

</body>
</html>
`;
}

module.exports = { buildDocument };
