const { esc, formatCitations, formatEffective, fieldRow, entityFieldRow } = require("./format");

/**
 * Render the inner contents of one <div class="change-card"> for a single
 * "Change" record, per the Release_Notes_XML_Schema Change element:
 *   Title, Citations, EffectiveFrom, EffectiveTo, Summary, Impact, ActionRequired
 * plus whichever EntityChangeBlock(s) apply (Rates | TaxabilityDecisions | TaxCodes | Nexus).
 *
 * @param {object} change
 * @param {string} change.title
 * @param {string[]} [change.citations]
 * @param {string} [change.effectiveFrom]
 * @param {string} [change.effectiveTo]
 * @param {string} [change.summary]
 * @param {string} [change.impact]
 * @param {string} [change.actionRequired]
 * @param {{additions?:string[], updations?:string[], deletions?:string[]}} [change.rates]
 * @param {{updations?:string[]}} [change.taxability]
 * @param {{additions?:string[], deletions?:string[]}} [change.taxCodes]
 * @param {{additions?:string[], updations?:string[], deletions?:string[]}} [change.nexus]
 */
function renderChangeCard(change) {
  const parts = [];

  parts.push(`<div class="change-title">${esc(change.title)}</div>`);

  const citationLine = formatCitations(change.citations);
  if (citationLine) parts.push(`<div class="citation">${esc(citationLine)}</div>`);

  const effective = formatEffective(change.effectiveFrom, change.effectiveTo);
  parts.push(fieldRow("Effective", effective));

  if (change.rates) {
    parts.push(entityFieldRow("Additions", change.rates.additions));
    parts.push(entityFieldRow("Updates", change.rates.updations));
    parts.push(entityFieldRow("Deletions", change.rates.deletions));
  }
  if (change.taxability) {
    parts.push(entityFieldRow("Updates", change.taxability.updations));
  }
  if (change.nexus) {
    parts.push(entityFieldRow("Additions", change.nexus.additions));
    parts.push(entityFieldRow("Updates", change.nexus.updations));
    parts.push(entityFieldRow("Deletions", change.nexus.deletions));
  }

  parts.push(fieldRow("Summary", change.summary));
  parts.push(fieldRow("Impact", change.impact));

  if (change.actionRequired) {
    parts.push(
      `<div class="action-required"><span class="field-label">Action Required:</span> ${esc(change.actionRequired)}</div>`
    );
  }

  if (change.taxCodes && (change.taxCodes.additions?.length || change.taxCodes.deletions?.length)) {
    const rows = [];
    if (change.taxCodes.additions?.length) {
      rows.push(
        `<div class="card-footer"><span class="tag-addition">Addition</span><span class="field-label">Tax Codes:</span><span class="field-value">${esc(
          change.taxCodes.additions.join("; ")
        )}</span></div>`
      );
    }
    if (change.taxCodes.deletions?.length) {
      rows.push(
        `<div class="card-footer"><span class="tag-deletion">Deletion</span><span class="field-label">Tax Codes:</span><span class="field-value">${esc(
          change.taxCodes.deletions.join("; ")
        )}</span></div>`
      );
    }
    parts.push(rows.join(""));
  }

  return parts.filter(Boolean).join("\n");
}

/** Wrap one or more changes for a single tax type in the light-gray "taxtype-card" container. */
function renderTaxTypeCard(taxType) {
  const changeCards = taxType.changes
    .map((c) => `<div class="change-card">${renderChangeCard(c)}</div>`)
    .join("\n");
  return `<div class="taxtype-card">
  <div class="taxtype-label">${esc(taxType.name)}</div>
  ${changeCards}
</div>`;
}

module.exports = { renderChangeCard, renderTaxTypeCard };
