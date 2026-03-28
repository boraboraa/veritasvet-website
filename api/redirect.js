// Redirect all non-www requests to www
module.exports = (req, res) => {
  const host = req.headers.host;
  if (host && !host.startsWith('www.')) {
    // Redirect to www version
    const url = `https://www.${host}${req.url}`;
    res.writeHead(301, { Location: url });
    res.end();
  } else {
    // Pass through to Next.js
    res.statusCode = 404;
    res.end('Not found');
  }
};
