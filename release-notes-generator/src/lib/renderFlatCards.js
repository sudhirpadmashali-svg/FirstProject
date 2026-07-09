const { esc } = require("./format");
const { renderTaxTypeCard, renderChangeCard } = require("./renderChangeCard");

/**
 * Render one flat jurisdiction card, matching International_VAT_Release_Notes.pdf:
 * a single bordered card with a header row (jurisdiction name / path) and a body
 * containing one or more tax-type sections.
 *
 * @param {object} node
 * @param {string} node.name         Header text, e.g. "European Union" or
 *                                    "Bloomington, Minnesota (City) — Hennepin County"
 * @param {object[]} node.taxTypes   Tax types with changes (see renderChangeCard.js)
 * @param {boolean} [bare]           If true, skip the taxtype-label wrapper and render the
 *                                    change fields directly (used by the VAT card design,
 *                                    which shows one tax type per country without its own
 *                                    nested change-card border).
 */
function renderFlatCard(node, { bare = false } = {}) {
  const body = bare
    ? node.taxTypes
        .map(
          (tt) =>
            `<div class="taxtype-label">${esc(tt.name)}</div>` +
            tt.changes.map(renderChangeCard).join("\n")
        )
        .join("\n")
    : node.taxTypes.map(renderTaxTypeCard).join("\n");

  return `<div class="country-card">
  <div class="country-header">${esc(node.name)}</div>
  <div class="country-body">
    ${body}
  </div>
</div>`;
}

/** Render a list of flat jurisdiction cards. */
function renderFlatCards(nodes, opts) {
  return nodes.map((n) => renderFlatCard(n, opts)).join("\n");
}

module.exports = { renderFlatCard, renderFlatCards };
