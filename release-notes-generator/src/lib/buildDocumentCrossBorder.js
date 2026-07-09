const fs = require("fs");
const path = require("path");
const { esc } = require("./format");
const {
  buildSystemsTable,
  buildDeMinimisSection,
  buildHsTaxonomySection,
  buildCustomsValuationSection,
  buildUpdatedContentSection,
  buildNewContentSection,
  buildResourcesSection,
} = require("./renderCrossBorder");

const CSS = fs.readFileSync(path.join(__dirname, "..", "styles-crossborder.css"), "utf8");

/**
 * Build the full Cross-Border release-note HTML document.
 * @param {object} config  config/crossborder.config.js
 * @param {object} data    see data/crossborder-sample.json for shape
 */
function buildCrossBorderDocument(config, data) {
  const sections = [
    buildSystemsTable(config, data),
    buildDeMinimisSection(config, data),
    buildHsTaxonomySection(config, data),
    buildCustomsValuationSection(config, data),
    buildUpdatedContentSection(config, data),
    buildNewContentSection(config, data),
    buildResourcesSection(config, data),
  ].join("\n\n");

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

<h1>${esc(config.docTitle)}</h1>
<div class="release-date">${esc(data.releaseMonthYear)}</div>
<div class="intro">
  <p>${esc(config.intro)}</p>
  <p>Avalara regularly updates Knowledge Center content and this document may be out of date. Please check back frequently for updates.</p>
</div>

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

module.exports = { buildCrossBorderDocument };
