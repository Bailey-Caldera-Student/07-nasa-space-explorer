const http = require('http');
const https = require('https');
const { URL } = require('url');

const port = process.env.PORT || 3000;
const nasaApiKey = process.env.NASA_API_KEY;

if (!nasaApiKey) {
  console.error('Missing NASA_API_KEY environment variable.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/apod')) {
    const requestUrl = new URL('https://api.nasa.gov/planetary/apod');
    requestUrl.searchParams.set('api_key', nasaApiKey);

    const date = new URL(req.url, `http://${req.headers.host}`).searchParams.get('date');
    if (date) {
      requestUrl.searchParams.set('date', date);
    }

    https.get(requestUrl, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode || 200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    }).on('error', () => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unable to fetch APOD data' }));
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
