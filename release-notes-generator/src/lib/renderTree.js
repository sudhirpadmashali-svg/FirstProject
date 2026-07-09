const { esc } = require("./format");
const { renderTaxTypeCard } = require("./renderChangeCard");

// CSS classes available for hierarchy depth, in order. Depths beyond the last
// entry re-use the final class (dashed gray guide) rather than failing.
const DEPTH_CLASSES = ["country", "state", "county", "city"];

function classForDepth(depth) {
  return DEPTH_CLASSES[Math.min(depth, DEPTH_CLASSES.length - 1)];
}

/**
 * Recursively render a jurisdiction node and its descendants using the nested
 * tree/guide-line design from US_Indirect_Taxes_Release_Notes.pdf.
 *
 * @param {object} node
 * @param {string} node.name              Display name, e.g. "Minneapolis"
 * @param {object[]} [node.taxTypes]       Tax types with changes at this node (see renderChangeCard.js)
 * @param {object[]} [node.children]       Child jurisdiction nodes
 * @param {number} [depth]                 Internal recursion depth (0 = country level)
 * @returns {string} HTML, or "" if this node and all descendants have no content to show.
 */
function renderJurisdictionNode(node, depth = 0) {
  const taxTypeHtml = (node.taxTypes || []).map(renderTaxTypeCard).join("\n");
  const childrenHtml = (node.children || [])
    .map((child) => renderJurisdictionNode(child, depth + 1))
    .filter(Boolean)
    .join("\n");

  if (!taxTypeHtml && !childrenHtml) return ""; // nothing to show under this branch

  const cls = classForDepth(depth);
  return `<div class="${cls}">
  <div class="name">${esc(node.name)}</div>
  ${taxTypeHtml}
  ${childrenHtml}
</div>`;
}

/** Render a forest of top-level (country) jurisdiction nodes. */
function renderJurisdictionTree(countries) {
  return countries.map((c) => renderJurisdictionNode(c, 0)).filter(Boolean).join("\n");
}

module.exports = { renderJurisdictionTree, renderJurisdictionNode };
