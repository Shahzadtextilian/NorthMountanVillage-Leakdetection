import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable trust proxy so Express recognizes X-Forwarded-Proto and X-Forwarded-Host from load balancers
app.set('trust proxy', true);

// 1. Direct Crawl Endpoints: Serve directly with HTTP 200 on all domains/protocols without redirects
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/llm.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'llm.txt'));
});

app.get('/favicon.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=604800');
  res.sendFile(path.join(__dirname, 'favicon.svg'));
});

// 2. Canonical Domain & HTTPS Enforcement Middleware
app.use((req, res, next) => {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
  const proto = req.headers['x-forwarded-proto'] || req.protocol;

  // Add HSTS and security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Single-hop canonical 301 redirection if requested via non-www apex or unencrypted http on custom domain
  if (host === 'northmountainvillageleakdetectionaz.com') {
    return res.redirect(301, `https://www.northmountainvillageleakdetectionaz.com${req.originalUrl}`);
  }

  if (host === 'www.northmountainvillageleakdetectionaz.com' && proto === 'http') {
    return res.redirect(301, `https://www.northmountainvillageleakdetectionaz.com${req.originalUrl}`);
  }

  next();
});

// Explicit 404 status for 404 page
app.get('/404.html', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// 301 Redirects from legacy individual area routes to unified canonical /areas/ page
const legacyAreaRoutes = [
  '/sunnyslope', '/sunnyslope/',
  '/moon-valley', '/moon-valley/',
  '/paradise-valley', '/paradise-valley/',
  '/deer-valley', '/deer-valley/',
  '/glendale', '/glendale/',
  '/alhambra', '/alhambra/',
  '/desert-ridge', '/desert-ridge/'
];
app.get(legacyAreaRoutes, (req, res) => {
  res.redirect(301, 'https://www.northmountainvillageleakdetectionaz.com/areas/');
});

// Serve static assets and html files
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

// Fallback to 404.html for unmatched routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
