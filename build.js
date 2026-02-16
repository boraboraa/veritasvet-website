const fs = require('fs');
const path = require('path');

const buildId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const timestamp = new Date().toISOString();

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Remove any existing build-id meta tag
html = html.replace(/<meta\s+name="build-id"[^>]*>\n?/g, '');

// Inject build-id meta tag after <meta charset>
html = html.replace(
  '<meta charset="UTF-8">',
  '<meta charset="UTF-8">\n<meta name="build-id" content="' + buildId + '" data-built="' + timestamp + '">'
);

fs.writeFileSync(indexPath, html, 'utf8');

console.log('Build ID injected: ' + buildId + ' at ' + timestamp);
