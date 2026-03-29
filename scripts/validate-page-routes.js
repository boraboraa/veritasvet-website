#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const manifestPath = path.join(root, 'scripts/route-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const keySet = new Set();
const errors = [];

for (const page of manifest.pages) {
  const key = `${page.lang}:${page.slug}`;
  if (keySet.has(key)) errors.push(`Duplicate route key: ${key}`);
  keySet.add(key);

  const filePath = path.join(root, page.file);
  if (!fs.existsSync(filePath)) errors.push(`Missing source file for ${key}: ${page.file}`);
}

const routeChecks = [
  { file: 'feed-quality/index.html', mustContain: ['/mycotoxin-binders/', '/gut-health/', '/feed-quality/', '/nutrition/'] },
  { file: 'gut-health/index.html', mustContain: ['/mycotoxin-binders/', '/gut-health/', '/feed-quality/', '/nutrition/'] },
  { file: 'mycotoxin-binders/index.html', mustContain: ['/mycotoxin-binders/', '/gut-health/', '/feed-quality/', '/nutrition/'] },
  { file: 'nutrition/index.html', mustContain: ['/mycotoxin-binders/', '/gut-health/', '/feed-quality/', '/nutrition/'] },
  { file: 'fr/feed-quality/index.html', mustContain: ['/fr/mycotoxin-binders/', '/fr/gut-health/', '/fr/feed-quality/', '/fr/nutrition/'] },
  { file: 'fr/gut-health/index.html', mustContain: ['/fr/mycotoxin-binders/', '/fr/gut-health/', '/fr/feed-quality/', '/fr/nutrition/'] },
  { file: 'fr/mycotoxin-binders/index.html', mustContain: ['/fr/mycotoxin-binders/', '/fr/gut-health/', '/fr/feed-quality/', '/fr/nutrition/'] },
  { file: 'fr/nutrition/index.html', mustContain: ['/fr/mycotoxin-binders/', '/fr/gut-health/', '/fr/feed-quality/', '/fr/nutrition/'] }
];

for (const check of routeChecks) {
  const text = fs.readFileSync(path.join(root, check.file), 'utf8');
  for (const needle of check.mustContain) {
    if (!text.includes(`href="${needle}"`) && !text.includes(needle)) {
      errors.push(`${check.file} missing required link: ${needle}`);
    }
  }
}

if (errors.length) {
  console.error('Route validation failed:');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log(`Route validation passed for ${manifest.pages.length} route entries.`);
