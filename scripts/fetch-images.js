#!/usr/bin/env node
/*
  Image URL fetcher via Bing Image Search API.
  Usage examples:
    node scripts/fetch-images.js --q "camisa lino premium|chino slim beige|buzo oversize negro" --count 3 --domains "macowens.com.ar,kevingston.com.ar"
    node scripts/fetch-images.js --file products.txt --count 5

  Env:
    BING_IMAGE_API_KEY=your_key

  Output:
    - Prints JSON mapping product name -> candidate URLs to stdout
    - Updates data/ml_image_cache.json with results for future use

  Note: Review licensing of images before embedding in the site.
*/

const fs = require('fs');
const path = require('path');
// No dependencies HTML parse (regex-based)

const API_KEY = process.env.BING_IMAGE_API_KEY || process.env.BING_API_KEY || process.env.BING_SEARCH_API_KEY;

// Simple argv parser
function parseArgs(argv) {
  const args = { q: '', file: '', count: 3, domains: [], domainsFile: '', provider: 'bing' };
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--q') args.q = argv[++i] || '';
    else if (a === '--file') args.file = argv[++i] || '';
    else if (a === '--count') args.count = parseInt(argv[++i] || '3', 10);
    else if (a === '--domains') args.domains = (argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
    else if (a === '--domains-file') args.domainsFile = argv[++i] || '';
    else if (a === '--provider') args.provider = (argv[++i] || 'bing');
    else if (a.startsWith('--')) {
      // unknown flag, skip possible value
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) i++;
    } else {
      positional.push(a);
    }
  }
  // Fallback: positional[0] as queries string, positional[1] as count if numeric
  if (!args.q && positional.length > 0) args.q = positional[0];
  // Allow provider as positional[1]
  const maybeProvider = (positional[1] || '').toLowerCase();
  const knownProviders = ['bing', 'ml', 'unsplash', 'pexels', 'pixabay'];
  if (knownProviders.includes(maybeProvider)) args.provider = maybeProvider;
  // Allow count as positional[2] or positional[1] if numeric
  if (!isNaN(Number(positional[2]))) args.count = Number(positional[2]);
  else if (!isNaN(Number(positional[1]))) args.count = Number(positional[1]);
  return args;
}

function normalizeDomain(d) {
  if (!d) return '';
  let s = d.trim();
  // Strip protocol
  s = s.replace(/^https?:\/\//, '');
  // Take only hostname part before first `/`
  const idx = s.indexOf('/');
  if (idx >= 0) s = s.slice(0, idx);
  // Remove trailing dots and spaces
  s = s.replace(/\.$/, '').trim();
  return s;
}

function readDomainsFile(domainsFile) {
  if (!domainsFile) return [];
  try {
    const p = path.resolve(domainsFile);
    const raw = fs.readFileSync(p, 'utf8');
    return raw
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(normalizeDomain)
      .filter(Boolean);
  } catch {
    console.error(`Could not read domains file: ${domainsFile}`);
    return [];
  }
}

async function fetchBingImages(query, count = 3) {
  if (!API_KEY) {
    throw new Error('Missing BING_IMAGE_API_KEY. Set it in your environment.');
  }
  const endpoint = 'https://api.bing.microsoft.com/v7.0/images/search';
  const url = new URL(endpoint);
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('safeSearch', 'Strict');
  url.searchParams.set('imageType', 'Photo');
  url.searchParams.set('size', 'Large');
  url.searchParams.set('mkt', 'es-AR');

  const res = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': API_KEY,
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bing API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const out = (data.value || []).map(v => ({
    name: v.name,
    contentUrl: v.contentUrl,
    hostPageUrl: v.hostPageUrl,
    hostPageDomain: v.hostPageDomainFriendlyName || '',
    thumbnailUrl: v.thumbnailUrl,
    width: v.width,
    height: v.height,
  }));
  return out;
}

async function fetchMercadoLibreImages(query) {
  const searchUrl = new URL('https://api.mercadolibre.com/sites/MLA/search');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('limit', '1');
  const sRes = await fetch(searchUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    }
  });
  if (!sRes.ok) {
    const text = await sRes.text();
    throw new Error(`ML search error ${sRes.status}: ${text}`);
  }
  const sData = await sRes.json();
  const first = (sData.results || [])[0];
  if (!first) return [];
  const itemId = first.id;
  const itemRes = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    }
  });
  if (!itemRes.ok) {
    const text = await itemRes.text();
    throw new Error(`ML item error ${itemRes.status}: ${text}`);
  }
  const item = await itemRes.json();
  const pictures = item.pictures || [];
  const pic = pictures[0];
  const permalink = item.permalink || (first.permalink || '');
  const domain = 'mercadolibre.com.ar';
  if (!pic) return [];
  return [{
    name: item.title || first.title || query,
    contentUrl: pic.url,
    hostPageUrl: permalink,
    hostPageDomain: domain,
    thumbnailUrl: first.thumbnail || '',
    width: pic.max_size || undefined,
    height: undefined,
  }];
}

async function fetchMercadoLibreHtmlFirst(query) {
  // Buscar listado público y tomar el primer enlace
  const q = encodeURIComponent(query);
  const url = `https://listado.mercadolibre.com.ar/${q}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ML HTML error ${res.status}: ${text}`);
  }
  const html = await res.text();
  // Buscar la primera URL a artículo
  const linkMatch = html.match(/href="(https?:\/\/[^\s"']*mercadolibre\.com[^\s"']*)"[^>]*class="[^"]*ui-search-link[^"]*"/i)
    || html.match(/<a[^>]+href="(https?:\/\/articulo\.mercadolibre\.com\.[^\s"']*)"/i)
    || html.match(/<a[^>]+href="(https?:\/\/[^\s"']*\/MLA-[^\s"']*)"/i);
  const firstLink = linkMatch ? linkMatch[1] : '';
  if (!firstLink) return [];
  // Buscar primera imagen del resultado
  const imgMatch = html.match(/<img[^>]+(?:data-src|src)="(https?:\/\/[^\s"']*mlstatic\.com[^\s"']*)"/i);
  const imgSrc = imgMatch ? imgMatch[1] : '';
  return [{
    name: query,
    contentUrl: imgSrc || '',
    hostPageUrl: firstLink,
    hostPageDomain: 'mercadolibre.com.ar',
    thumbnailUrl: imgSrc || '',
  }];
}

function filterByDomains(results, domains) {
  if (!domains || domains.length === 0) return results;
  const norm = domains.map(normalizeDomain);
  return results.filter(r =>
    norm.some(d => (r.hostPageDomain || '').includes(d) || (r.contentUrl || '').includes(d) || (r.hostPageUrl || '').includes(d))
  );
}

function readQueries(args) {
  if (args.file) {
    const p = path.resolve(args.file);
    const raw = fs.readFileSync(p, 'utf8');
    return raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
  if (args.q) {
    return args.q.split('|').map(s => s.trim()).filter(Boolean);
  }
  console.error('Provide --q "prod1|prod2|..." or --file products.txt');
  process.exit(1);
}

function loadCache() {
  const cachePath = path.resolve('data/ml_image_cache.json');
  try {
    const raw = fs.readFileSync(cachePath, 'utf8');
    return { path: cachePath, data: JSON.parse(raw) };
  } catch {
    return { path: cachePath, data: {} };
  }
}

function saveCache(cache, updates) {
  const merged = { ...cache.data, ...updates };
  fs.mkdirSync(path.dirname(cache.path), { recursive: true });
  fs.writeFileSync(cache.path, JSON.stringify(merged, null, 2));
}

(async function main() {
  const args = parseArgs(process.argv);
  const queries = readQueries(args);
  const cache = loadCache();
  const fromFile = readDomainsFile(args.domainsFile);
  const domains = Array.from(new Set([...(args.domains || []).map(normalizeDomain), ...fromFile]));

  const resultMap = {};

  for (const q of queries) {
    try {
      let res = [];
      let candidates = [];
      if (args.provider === 'ml') {
        try {
          res = await fetchMercadoLibreImages(q);
          candidates = res;
        } catch (mlErr) {
          // Fallback 1: HTML público de ML
          try {
            const htmlRes = await fetchMercadoLibreHtmlFirst(q);
            candidates = htmlRes;
          } catch {
            // Fallback 2: Bing con dominios de Mercado Libre
            const mlDomains = ['mlstatic.com', 'mercadolibre.com.ar', 'mercadolibre.com'];
            const combined = Array.from(new Set([...(domains || []), ...mlDomains]));
            const bingRes = await fetchBingImages(q, args.count);
            candidates = filterByDomains(bingRes, combined);
          }
        }
      } else {
        const bingRes = await fetchBingImages(q, args.count);
        candidates = filterByDomains(bingRes, domains);
      }
      // Pick best candidate (first) and include list
      const best = candidates[0] || null;
      resultMap[q] = {
        best_image_url: best ? best.contentUrl : null,
        best_host_page: best ? best.hostPageUrl : null,
        candidates,
        fetched_at: new Date().toISOString(),
      };
    } catch (err) {
      resultMap[q] = { error: String(err.message || err) };
    }
  }

  // Print to stdout
  process.stdout.write(JSON.stringify(resultMap, null, 2) + '\n');

  // Update cache with a simpler mapping for quick use when best exists
  const updates = {};
  for (const [name, info] of Object.entries(resultMap)) {
    if (info && info.best_image_url) {
      updates[name] = {
        product_url: info.best_host_page || '',
        image_url: info.best_image_url,
      };
    }
  }
  if (Object.keys(updates).length > 0) {
    saveCache(cache, updates);
    console.error(`Updated cache at ${cache.path} with ${Object.keys(updates).length} items.`);
  } else {
    console.error('No cache updates (no best_image_url found).');
  }
})();
