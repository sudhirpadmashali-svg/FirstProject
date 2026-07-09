/**
 * Section configuration for "US Indirect Taxes" (SUT) release notes.
 * The `heading` and prompt text below are copied verbatim from
 * SUT_ReleaseNote_Template_forAutomation.docx so the generator stays a
 * faithful implementation of that template, not a reinterpretation of it.
 */
module.exports = {
  contentType: "sut",
  docTitle: "Avalara AvaTax Sales & Use Tax Release Notes",
  intro:
    "This is a summary of system updates. It includes economic nexus threshold changes, tax rate changes, taxability rule changes, tax code changes, and jurisdiction content updates.",
  parentTopic: "AvaTax Sales & Use Tax Release Notes",
  metaFields: [
    { label: "Window", key: "window" },
    { label: "Generated", key: "generated" },
  ],
  jurisdictionTable: {
    heading: "Jurisdictions Updated",
    overview:
      "Summarize which jurisdictions' tax content was refreshed in this release. Effective dates reflect the latest available content synchronization.",
  },
  // hierarchyStyle: "tree" gives the nested Country > State > County > City
  // guide-line design (US_Indirect_Taxes_Release_Notes.pdf).
  hierarchyStyle: "tree",
  categorySections: [
    {
      category: "nexus",
      heading: "Changes to Economic Nexus Thresholds",
      noChangesText: "No changes to economic nexus thresholds in this release.",
      render: "bulletList", // simple bullet list, not full change cards (per docx template)
    },
    {
      category: "rate",
      heading: "Changes to Tax Rates",
      noChangesText: "No rate changes in this release.",
      render: "hierarchy",
    },
    {
      category: "taxability",
      heading: "Changes to Taxability Rules",
      noChangesText: "No changes.",
      render: "flatCards",
    },
  ],
  taxCodesSection: {
    heading: "Updated Tax Codes",
    overview: "Summarize tax code additions and deletions. Group by jurisdiction and tax type.",
    noChangesText: "No changes.",
  },
  newJurisdictionsSection: {
    heading: "New Jurisdictions or Tax Types Added",
    noChangesText: "No changes.",
  },
  resourcesSection: {
    heading: "Supporting Resources",
  },
};
