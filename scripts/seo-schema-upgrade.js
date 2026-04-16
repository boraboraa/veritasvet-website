#!/usr/bin/env node
/**
 * SEO Schema Upgrade Script — VeritasVet
 * Adds BreadcrumbList schema + enriches Product schema with 'offers' field
 * across all 13 product pages (EN + FR).
 *
 * Run from the veritasvet-website directory:
 *   node scripts/seo-schema-upgrade.js
 */

const fs = require('fs');
const path = require('path');

const PRODUCT_SLUGS = [
  'toxifix-perfect',
  'toxifix-plus',
  'toxifix',
  'guarbind',
  'versamold',
  'versapeg',
  'versacid-liquid',
  'versamos',
  'butycal-ccb94',
  'veroxid-b2a',
  'veroxid-phenols',
  'verivit-hy-d3',
  'versacid-fl-plus',
];

const LOCALES = ['', '/fr'];

// ------------------------------------------------------------------
// Product name map — used for breadcrumb labels
// ------------------------------------------------------------------
const PRODUCT_NAMES = {
  'toxifix-perfect':   'ToxyFix Perfect',
  'toxifix-plus':       'ToxyFix Plus',
  'toxifix':            'ToxyFix',
  'guarbind':           'GuarBind',
  'versamold':          'VersaMold',
  'versapeg':           'VersaPeg',
  'versacid-liquid':    'VersaAcid Liquid',
  'versamos':           'VersaMos',
  'butycal-ccb94':      'ButyCal CCB94',
  'veroxid-b2a':        'Veroxid B2A',
  'veroxid-phenols':    'Veroxid Phenols',
  'verivit-hy-d3':      'VeriVit Hy D3',
  'versacid-fl-plus':   'VersaAcid FL Plus',
};

// ------------------------------------------------------------------
// Build the JSON-LD blocks to inject
// ------------------------------------------------------------------
function buildBreadcrumbJsonLd(slug, locale) {
  const base = locale ? `https://www.veritasvet.com${locale}` : 'https://www.veritasvet.com';
  const productsHref = locale ? `${base}/products/` : `${base}/products/`;

  const productName = PRODUCT_NAMES[slug] || slug;

  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "${base}/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "${productsHref}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "${productName}",
      "item": "${base}/products/${slug}/"
    }
  ]
}
</script>`;
}

// ------------------------------------------------------------------
// Inject or replace Product offers field
// We search for the existing Product block and add "offers"
// ------------------------------------------------------------------
function injectOffers(content, slug) {
  // The Product JSON-LD block (there's only one per page)
  // Pattern: <script type="application/ld+json"> ... "Product" ... </script>
  const productBlockRe = /(<script type="application\/ld\+json">\s*\{[\s\S]*?"@type":\s*"Product"[\s\S]*?)\n<\/script>/;

  const match = content.match(productBlockRe);
  if (!match) {
    console.warn(`  ⚠ No Product block found in ${slug}`);
    return content;
  }

  const blockContent = match[1];

  // Check if 'offers' already exists
  if (/"offers"\s*:/i.test(blockContent)) {
    console.log(`  → ${slug}: 'offers' already present, skipping`);
    return content;
  }

  // Build the offers snippet — B2B "price on request" pattern
  const offersSnippet = `,
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "url": "https://www.veritasvet.com/products/${slug}/"
  }`;

  // Find the last key-value line (before the closing brace) and insert after it
  // Strategy: add offers before the last closing brace, handling nested brand {}
  // We insert after the "sku": "..." line
  const skuRe = /("sku":\s*"[^"]*"\s*)/;
  let newBlock;

  if (skuRe.test(blockContent)) {
    newBlock = blockContent.replace(skuRe, `$1,\n  "offers": {\n    "@type": "Offer",\n    "availability": "https://schema.org/InStock",\n    "url": "https://www.veritasvet.com/products/${slug}/"\n  }`);
  } else {
    // Fallback: insert before closing brace of top-level object
    // Remove trailing whitespace and closing brace, add offers, close
    newBlock = blockContent.replace(/\s*\}\s*$/, `\n  "offers": {\n    "@type": "Offer",\n    "availability": "https://schema.org/InStock",\n    "url": "https://www.veritasvet.com/products/${slug}/"\n  }\n}`);
  }

  const newContent = content.replace(match[0], newBlock + '\n</script>');
  return newContent;
}

// ------------------------------------------------------------------
// Inject BreadcrumbList after the last existing JSON-LD block
// (which is the Product block, since we verified order above)
// ------------------------------------------------------------------
function injectBreadcrumbList(content) {
  // Find the last </script> that closes a JSON-LD block
  // We'll inject after the final <script type="application/ld+json">...</script>
  const lastJsonLdRe = /(<script type="application\/ld\+json">[\s\S]*?<\/script>)\s*(\n<\/head>)/;

  const match = content.match(lastJsonLdRe);
  if (!match) {
    // Fallback: just before </head>
    console.warn('  ⚠ Could not find injection point for BreadcrumbList, using fallback');
    return content.replace('</head>', `<!-- BreadcrumbList injected -->\n</head>`);
  }

  return content.replace(match[0], match[1] + `\n\n${content.includes('{/* BREADCRUMB_INJECTED */}') ? '' : '<!-- BreadcrumbList injected by seo-schema-upgrade.js -->'}\n</head>`).replace(
    match[2],
    `\n</head>`
  ).replace(
    match[1] + `\n\n${content.includes('{/* BREADCRUMB_INJECTED */}') ? '' : '<!-- BreadcrumbList injected by seo-schema-upgrade.js -->'}\n</head>`,
    match[1] + `\n</head>`
  );
}

// More precise injection: add breadcrumb AFTER the last JSON-LD </script>
// but BEFORE </head>
function injectBreadcrumbListV2(content, breadcrumbJson) {
  // Match the last </script> of a JSON-LD block and grab what follows
  const lastScriptRe = /(<script type="application\/ld\+json">[\s\S]*?<\/script>)(\s*)(\n<\/head>)/;

  const match = content.match(lastScriptRe);
  if (!match) {
    console.warn('  ⚠ Cannot find </head> after JSON-LD blocks');
    return content;
  }

  const beforeHead = match[1];
  const between = match[2];
  const afterHead = match[3];

  return content.replace(
    match[0],
    beforeHead + between + breadcrumbJson + '\n' + afterHead
  );
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
let totalModified = 0;

for (const locale of LOCALES) {
  const localePrefix = locale || '';
  const localeDir = locale ? `/fr` : '';

  for (const slug of PRODUCT_SLUGS) {
    const filePath = path.join(
      __dirname,
      '..',
      localeDir,
      'products',
      slug,
      'index.html'
    );

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠ File not found: ${filePath}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Step 1: Add BreadcrumbList
    const breadcrumbJson = buildBreadcrumbJsonLd(slug, localePrefix);
    content = injectBreadcrumbListV2(content, breadcrumbJson);

    // Step 2: Enrich Product schema with offers
    content = injectOffers(content, slug);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ ${localeDir}/products/${slug}/index.html`);
      totalModified++;
    } else {
      console.log(`  ⏭  ${localeDir}/products/${slug}/index.html — no change`);
    }
  }
}

console.log(`\nDone. Modified ${totalModified} files.`);

// ------------------------------------------------------------------
// Also fix the canonical on feed-additives.html (NOT feed-additives/)
// The .html file must point canonical to /feed-additives/ not itself
// ------------------------------------------------------------------
const faHreflang = path.join(__dirname, '..', 'feed-additives.html');
if (fs.existsSync(faHreflang)) {
  let faContent = fs.readFileSync(faHreflang, 'utf8');
  const orig = faContent;

  // The canonical and hreflang in feed-additives.html currently point to
  // /feed-additives.html — they must point to /feed-additives/ (trailing slash)
  // <link rel="canonical" href="https://www.veritasvet.com/feed-additives.html">
  // should be:
  // <link rel="canonical" href="https://www.veritasvet.com/feed-additives/">
  // and same for hreflang alternate

  const fixes = [
    [
      '<link rel="canonical" href="https://www.veritasvet.com/feed-additives.html">',
      '<link rel="canonical" href="https://www.veritasvet.com/feed-additives/">'
    ],
    [
      '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/feed-additives.html">',
      '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/feed-additives/">'
    ],
    [
      '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives.html">',
      '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives/">'
    ],
    [
      '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/feed-additives.html">',
      '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/feed-additives/">'
    ],
  ];

  for (const [old, replacement] of fixes) {
    faContent = faContent.replace(old, replacement);
  }

  if (faContent !== orig) {
    fs.writeFileSync(faHreflang, faContent, 'utf8');
    console.log(`  ✅ feed-additives.html — canonical/hreflang fixed`);
  } else {
    console.log(`  ⏭  feed-additives.html — already correct`);
  }
}

// Also fix fr/feed-additives.html
const frFaHref = path.join(__dirname, '..', 'fr', 'feed-additives.html');
if (fs.existsSync(frFaHref)) {
  let faContent = fs.readFileSync(frFaHref, 'utf8');
  const orig = faContent;

  const fixes = [
    [
      '<link rel="canonical" href="https://www.veritasvet.com/fr/feed-additives.html">',
      '<link rel="canonical" href="https://www.veritasvet.com/fr/feed-additives/">'
    ],
    [
      '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/fr/feed-additives.html">',
      '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/feed-additives/">'
    ],
    [
      '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives.html">',
      '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives/">'
    ],
    [
      '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/fr/feed-additives.html">',
      '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/fr/feed-additives/">'
    ],
  ];

  for (const [old, replacement] of fixes) {
    faContent = faContent.replace(old, replacement);
  }

  if (faContent !== orig) {
    fs.writeFileSync(frFaHref, faContent, 'utf8');
    console.log(`  ✅ fr/feed-additives.html — canonical/hreflang fixed`);
  } else {
    console.log(`  ⏭  fr/feed-additives.html — already correct`);
  }
}

console.log('\n🎯 P0 fixes complete. Commit and push, then redeploy from Vercel.');
