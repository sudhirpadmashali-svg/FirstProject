/**
 * Section configuration for "Cross-Border" release notes.
 * Headings and prompt text are copied verbatim from
 * CrossBorder_ReleaseNote_Template_forAutomation.docx so the generator stays a
 * faithful implementation of that template.
 *
 * Unlike sut/vat, Cross-Border uses the "systems" document model: content is
 * organized around content systems (HTS taxonomies / regions) rather than a
 * nested jurisdiction tree. The section builders live in
 * src/lib/sectionsCrossBorder.js; each categorySection below is dispatched by
 * its `render` mode and reads the data key named by `key`.
 */
module.exports = {
  contentType: "cb",
  documentModel: "systems",
  docTitle: "Avalara AvaTax Cross-Border Release Notes",
  intro:
    "This is a summary of system updates. It includes de minimis rules, HS taxonomy changes, customs valuation approaches, and cross-border content updates.",
  parentTopic: "AvaTax Cross-Border Release Notes",
  metaFields: [
    { label: "Release Window", key: "window" },
    { label: "Content Sync", key: "contentSyncDate" },
    { label: "Generated", key: "generated" },
  ],
  systemsTable: {
    heading: "Systems Updated",
    overview:
      "Summarize which content systems were refreshed in this release. Effective dates reflect the latest available content synchronization.",
    noChangesText: "No content systems updated in this release.",
  },
  categorySections: [
    {
      key: "deMinimis",
      heading: "Changes to De Minimis Rules",
      render: "deMinimisList",
      noChangesText: "No changes to de minimis rules in this release.",
    },
    {
      key: "hsTaxonomy",
      heading: "Changes to HS Taxonomy",
      render: "systemAddDelete",
      noChangesText: "No HS taxonomy changes in this release.",
    },
    {
      key: "customsValuation",
      heading: "Changes to Customs Valuation Approaches",
      render: "freeText",
      noChangesText: "No changes.",
    },
    {
      key: "crossBorderContent",
      heading: "Updated Cross-Border Content",
      render: "systemMfnPreferential",
      overview:
        "Summarize MFN and preferential rate updates. Where volume is high, the full list of FTAs is condensed. Grouped by system.",
      noChangesText: "No cross-border content updates in this release.",
    },
  ],
  newContentSection: {
    heading: "New Cross-Border Content Added",
    noChangesText: "No changes.",
  },
  resourcesSection: {
    heading: "Supporting Resources",
  },
};
