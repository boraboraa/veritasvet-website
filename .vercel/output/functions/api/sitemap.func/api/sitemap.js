const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  const sitemapPath = path.join(process.cwd(), 'sitemap-data.xml');
  const xml = fs.readFileSync(sitemapPath, 'utf8');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).send(xml);
};
