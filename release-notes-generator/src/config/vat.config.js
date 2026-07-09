/**
 * Section configuration for "International VAT" release notes.
 * Headings/prompt text copied verbatim from
 * VATInternational_ReleaseNote_Template_forAutomation.docx.
 */
module.exports = {
  contentType: "vat",
  docTitle: "Avalara AvaTax VAT International Release Notes",
  intro:
    "This is a summary of system updates. It includes VAT registration threshold changes, VAT rate changes, taxability and exemption rule changes, tax code changes, and jurisdiction content updates.",
  parentTopic: "AvaTax VAT International Release Notes",
  metaFields: [
    { label: "Release Window", key: "window" },
    { label: "Content Type", key: "contentTypeLabel" },
    { label: "Generated", key: "generated" },
  ],
  jurisdictionTable: {
    heading: "Jurisdictions Updated",
    overview:
      "Summarize which jurisdictions' VAT content was refreshed in this release. Effective dates reflect the latest available content synchronization.",
  },
  // hierarchyStyle: "card" gives the flat bordered-country-card design
  // (International_VAT_Release_Notes.pdf) instead of the nested tree — VAT
  // jurisdictions in the sample data are country-level only. If a future
  // release needs sub-national VAT jurisdictions (e.g. Canadian GST/PST),
  // switch this to "tree" and the same renderer used by SUT applies.
  hierarchyStyle: "card",
  categorySections: [
    {
      category: "registrationThreshold",
      heading: "Changes to VAT Registration Thresholds",
      noChangesText: "No changes to VAT registration thresholds in this release.",
      render: "bulletList",
    },
    {
      category: "rate",
      heading: "Changes to VAT Rates",
      noChangesText: "No VAT rate changes in this release.",
      render: "hierarchy",
    },
    {
      category: "taxability",
      heading: "Changes to Taxability and Exemption Rules",
      noChangesText: "No changes.",
      render: "flatCards",
    },
  ],
  taxCodesSection: {
    heading: "Updated Tax Codes",
    overview: "Summarize tax code additions and deletions. Group by jurisdiction.",
    noChangesText: "No changes.",
  },
  newJurisdictionsSection: {
    heading: "New Jurisdictions or VAT Regimes Added",
    noChangesText: "No changes.",
  },
  resourcesSection: {
    heading: "Supporting Resources",
  },
};
