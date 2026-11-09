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

// 2. Canonical Path Normalizer & Single-Hop Redirection Map
const LEGACY_AREA_ROUTES = new Set([
  '/sunnyslope', '/sunnyslope/',
  '/moon-valley', '/moon-valley/',
  '/paradise-valley', '/paradise-valley/',
  '/deer-valley', '/deer-valley/',
  '/glendale', '/glendale/',
  '/alhambra', '/alhambra/',
  '/desert-ridge', '/desert-ridge/'
]);

const DIRECTORY_ROUTES = new Set([
  '/about',
  '/areas',
  '/blog',
  '/contact',
  '/disclaimer',
  '/gas-leak-detection',
  '/pipe-leak-repair',
  '/privacy-policy',
  '/sitemap',
  '/slab-leak-detection',
  '/water-leak-detection',
  '/leak-detection-north-mountain-village-phoenix-az',
  '/blog/complete-leak-detection-guide',
  '/blog/underground-water-line-leak-detection',
  '/blog/how-to-detect-hidden-water-leak',
  '/blog/how-to-detect-slab-leak',
  '/blog/gas-leak-detection-emergency-guide',
  '/blog/modern-leak-detect-methods',
  '/blog/pipe-leak-repair-options-costs'
]);

function resolveCanonicalPath(pathname) {
  // Legacy area routes -> /areas/
  if (LEGACY_AREA_ROUTES.has(pathname)) {
    return '/areas/';
  }
  // Legacy aliases
  if (pathname === '/gas-leak' || pathname === '/gas-leak/') {
    return '/gas-leak-detection/';
  }
  if (pathname === '/water-leak' || pathname === '/water-leak/') {
    return '/water-leak-detection/';
  }
  if (pathname === '/blog/leak-detection-north-mountain-village-phoenix-az' || pathname === '/blog/leak-detection-north-mountain-village-phoenix-az/') {
    return '/leak-detection-north-mountain-village-phoenix-az/';
  }

  // If path is a directory without trailing slash, enforce canonical trailing slash
  if (DIRECTORY_ROUTES.has(pathname)) {
    return pathname + '/';
  }

  return pathname;
}

// Canonical Domain, HTTPS, and Clean URL Enforcement Middleware
app.use((req, res, next) => {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].toLowerCase();
  const proto = (req.headers['x-forwarded-proto'] || req.protocol).toLowerCase();

  // Add HSTS and security headers
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const [reqPath, queryString] = req.originalUrl.split('?');
  const canonicalPath = resolveCanonicalPath(reqPath);
  const querySuffix = queryString ? `?${queryString}` : '';

  const isApex = host === 'northmountainvillageleakdetectionaz.com';
  const isWww = host === 'www.northmountainvillageleakdetectionaz.com';
  const isHttp = proto === 'http';

  // 1. Direct single-hop 301 redirection for apex domain or non-secure HTTP
  if (isApex || (isWww && isHttp)) {
    return res.redirect(301, `https://www.northmountainvillageleakdetectionaz.com${canonicalPath}${querySuffix}`);
  }

  // 2. Direct single-hop 301 redirection on canonical domain if path is non-canonical (e.g. missing trailing slash or legacy alias)
  if (isWww && reqPath !== canonicalPath) {
    return res.redirect(301, `https://www.northmountainvillageleakdetectionaz.com${canonicalPath}${querySuffix}`);
  }

  // 3. For local dev / preview environments, enforce path canonicalization
  if (!isApex && !isWww && reqPath !== canonicalPath) {
    return res.redirect(301, `${canonicalPath}${querySuffix}`);
  }

  next();
});

// Explicit 404 status for 404 page
app.get('/404.html', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
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
