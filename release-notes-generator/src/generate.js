#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { buildDocument } = require("./lib/buildDocument");
const { buildCrossBorderDocument } = require("./lib/buildDocumentCrossBorder");

const CONFIGS = {
  sut: require("./config/sut.config"),
  vat: require("./config/vat.config"),
  crossborder: require("./config/crossborder.config"),
};

const BUILDERS = {
  sut: buildDocument,
  vat: buildDocument,
  crossborder: buildCrossBorderDocument,
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    args[key] = argv[i + 1];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { type, input, output } = args;

  if (!type || !CONFIGS[type]) {
    console.error(`Usage: node generate.js --type <sut|vat|crossborder> --input <data.json> --output <out.html>`);
    process.exit(1);
  }
  if (!input || !output) {
    console.error("Both --input and --output are required.");
    process.exit(1);
  }

  const config = CONFIGS[type];
  const build = BUILDERS[type];
  const data = JSON.parse(fs.readFileSync(input, "utf8"));
  const html = build(config, data);

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html, "utf8");
  console.log(`Wrote ${output} (${html.length} bytes)`);
}

main();
