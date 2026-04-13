const fs = require('fs');
const path = require('path');

const GTM_ID = 'GTM-PC9VKZ7T';

// GTM head snippet - insert as first child of <head>
const GTM_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');</script>
<!-- End Google Tag Manager -->
`;

// GTM noscript body snippet - insert as first child of <body>
const GTM_NOSCRIPT = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;

// Only process static HTML files (not in node_modules, not already processed)
const SKIP_DIRS = ['node_modules', '.git', 'fr'];
const ALREADY_TAG = 'GTM-PC9VKZ7T';

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has GTM
  if (content.includes(ALREADY_TAG)) {
    console.log('  SKIP (already has GTM): ' + filePath);
    return;
  }
  
  // Skip non-HTML files
  if (!filePath.endsWith('.html')) return;
  
  let updated = content;
  
  // Insert GTM head snippet right after <head> tag (or <head lang="...">)
  if (!updated.includes('googletagmanager.com/gtm.js')) {
    updated = updated.replace(
      /<head([^>]*)>/,
      `<head$1>\n${GTM_HEAD}`
    );
  }
  
  // Insert noscript iframe right after <body> tag
  if (!updated.includes('googletagmanager.com/ns.html')) {
    updated = updated.replace(
      /<body([^>]*)>/,
      `<body$1>\n${GTM_NOSCRIPT}`
    );
  }
  
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('  ADDED: ' + filePath);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.includes(entry.name)) {
        walkDir(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      processFile(fullPath);
    }
  }
}

// Process root directory (English pages)
const rootDir = '/home/ubuntu/veritasvet-website';
const entries = fs.readdirSync(rootDir, { withFileTypes: true });
let count = 0;
for (const entry of entries) {
  const fullPath = path.join(rootDir, entry.name);
  if (entry.isFile() && entry.name.endsWith('.html')) {
    processFile(fullPath);
    count++;
  } else if (entry.isDirectory() && !SKIP_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
    walkDir(fullPath);
    count++;
  }
}

console.log(`\nDone! GTM-${GTM_ID} added to all pages.`);
