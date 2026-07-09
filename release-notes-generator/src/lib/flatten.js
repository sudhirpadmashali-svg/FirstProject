/**
 * Walks the jurisdiction tree (see data/*.json) to produce the flat lists each
 * docx-template section needs. The tree itself stays hierarchical (for the
 * SUT nested-tree renderer); these helpers are how the *other* sections
 * (Jurisdictions Updated, Updated Tax Codes, etc.) pull data out of it
 * without duplicating it in the source JSON.
 */

function pathLabel(ancestors, node) {
  return [...ancestors, node.name].join(" > ");
}

/** Depth-first walk. Calls visit(node, ancestors) for every node in the tree. */
function walk(nodes, ancestors, visit) {
  for (const node of nodes) {
    visit(node, ancestors);
    if (node.children && node.children.length) {
      walk(node.children, [...ancestors, node.name], visit);
    }
  }
}

/**
 * Collect every node that has an explicit effectiveDate, for the
 * "Jurisdictions Updated" table. Returns rows in document order.
 */
function collectJurisdictionsUpdated(tree) {
  const rows = [];
  walk(tree, [], (node, ancestors) => {
    if (node.effectiveDate || node.code) {
      rows.push({
        code: node.code || "",
        name: node.name,
        level: node.level || "",
        path: pathLabel(ancestors, node),
        effectiveDate: node.effectiveDate || null,
      });
    }
  });
  return rows.filter((r) => r.effectiveDate !== undefined); // keep all; caller decides what to show
}

/**
 * Collect every {change, taxType, node, ancestors} triple in the tree whose
 * change.category matches the requested category ("rate" | "taxability" | "nexus").
 * Used to build the category-specific sections (Changes to Tax Rates, etc.)
 * independently of how deep in the hierarchy the change lives.
 */
function collectChangesByCategory(tree, category) {
  const results = [];
  walk(tree, [], (node, ancestors) => {
    for (const taxType of node.taxTypes || []) {
      for (const change of taxType.changes || []) {
        if (change.category === category) {
          results.push({ node, ancestors, taxType, change });
        }
      }
    }
  });
  return results;
}

/**
 * Build a pruned copy of the tree containing only nodes/taxTypes/changes whose
 * change.category matches, preserving hierarchy. Used by the tree renderer so
 * the "Changes to Tax Rates" section only shows rate changes, not every change
 * in the source data.
 */
function pruneTreeByCategory(tree, category) {
  return tree
    .map((node) => pruneNode(node, category))
    .filter(Boolean);
}

function pruneNode(node, category) {
  const taxTypes = (node.taxTypes || [])
    .map((tt) => ({
      ...tt,
      changes: (tt.changes || []).filter((c) => c.category === category),
    }))
    .filter((tt) => tt.changes.length > 0);

  const children = (node.children || [])
    .map((child) => pruneNode(child, category))
    .filter(Boolean);

  if (taxTypes.length === 0 && children.length === 0) return null;
  return { ...node, taxTypes, children };
}

/**
 * Collect tax-code additions/deletions across the whole tree (regardless of
 * which category the parent change belongs to), for the standalone
 * "Updated Tax Codes" section.
 */
function collectTaxCodeSummaries(tree) {
  const summaries = [];
  walk(tree, [], (node, ancestors) => {
    for (const taxType of node.taxTypes || []) {
      for (const change of taxType.changes || []) {
        if (change.taxCodes && (change.taxCodes.additions?.length || change.taxCodes.deletions?.length)) {
          summaries.push({
            path: pathLabel(ancestors, node),
            additions: change.taxCodes.additions || [],
            deletions: change.taxCodes.deletions || [],
          });
        }
      }
    }
  });
  return summaries;
}

module.exports = {
  collectJurisdictionsUpdated,
  collectChangesByCategory,
  pruneTreeByCategory,
  collectTaxCodeSummaries,
};
