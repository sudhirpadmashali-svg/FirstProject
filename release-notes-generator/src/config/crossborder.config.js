/**
 * Section configuration for Cross-Border release notes.
 * Headings/prompt text copied verbatim from
 * CrossBorder_ReleaseNote_Template_forAutomation.docx.
 */
module.exports = {
  contentType: "crossborder",
  docTitle: "Avalara AvaTax Cross-Border Release Notes",
  intro:
    "This is a summary of system updates. It includes de minimis rules, HS taxonomy changes, customs valuation approaches, and cross-border content updates.",
  parentTopic: "AvaTax Cross-Border Release Notes",
  systemsTable: {
    heading: "Systems Updated",
    overview:
      "The following content systems were refreshed in this release. Effective dates reflect the latest available content synchronization.",
  },
  deMinimisSection: {
    heading: "Changes to De Minimis Rules",
    noChangesText: "No changes to de minimis rules in this release.",
  },
  hsTaxonomySection: {
    heading: "Changes to HS Taxonomy",
    noChangesText: "No HS taxonomy changes in this release.",
  },
  customsValuationSection: {
    heading: "Changes to Customs Valuation Approaches",
    noChangesText: "No changes.",
  },
  updatedContentSection: {
    heading: "Updated Cross-Border Content",
    overview: "Summary of MFN and preferential rate updates, grouped by system.",
    noChangesText: "No changes.",
  },
  newContentSection: {
    heading: "New Cross-Border Content Added",
    noChangesText: "No changes.",
  },
  resourcesSection: {
    heading: "Supporting Resources",
  },
};
