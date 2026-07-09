/**
 * Small, dependency-free helpers shared by every renderer.
 */

/** Escape a value for safe insertion into HTML text content. */
function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Join an array of citation strings into a single "Citation: a; b" line, or "" if empty. */
function formatCitations(citations) {
  if (!citations || citations.length === 0) return "";
  const label = citations.length > 1 ? "Citations" : "Citation";
  return `${label}: ${citations.map(esc).join("; ")}`;
}

/** Format an effective-date range. Returns "" if no effectiveFrom is present. */
function formatEffective(effectiveFrom, effectiveTo) {
  if (!effectiveFrom) return "";
  return effectiveTo ? `${effectiveFrom} to ${effectiveTo}` : effectiveFrom;
}

/** Render a single label/value field row. Omits the row entirely if value is falsy. */
function fieldRow(label, value) {
  if (!value) return "";
  return `<div class="field-row"><span class="field-label">${esc(label)}:</span><span class="field-value">${esc(value)}</span></div>`;
}

/**
 * Render an entity-change-block field (Additions / Updations / Deletions) as a field row.
 * Accepts an array of strings; joins with "; ". Returns "" if the array is empty.
 * Per the XML schema, an empty/omitted block means "no change of that kind" and is
 * simply not rendered (the docx template's "or none" instruction is satisfied by omission
 * unless the whole change has nothing to show, in which case caller should fall back to
 * the section-level "No changes" text).
 */
function entityFieldRow(label, items) {
  if (!items || items.length === 0) return "";
  return fieldRow(label, items.join("; "));
}

module.exports = { esc, formatCitations, formatEffective, fieldRow, entityFieldRow };
