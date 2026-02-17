// Import estático del cache para ser usable en Client Components
// Asegúrate de que tsconfig.json tenga resolveJsonModule: true
// Ruta relativa desde src/lib a data/ml_image_cache.json
// Turbopack recargará en dev al cambiar el archivo.
import cacheJson from '../../data/ml_image_cache.json';

let cacheData: Record<string, { image_url?: string; product_url?: string }> = (cacheJson as any) || {};

function loadCache(): Record<string, { image_url?: string; product_url?: string }> {
  return cacheData;
}

export function getCachedImageForTitle(title: string): string | null {
  const data = loadCache();
  // Exact match
  const hit = data[title];
  if (hit && hit.image_url) return hit.image_url;
  // Fallback: case-insensitive lookup
  const key = Object.keys(data).find(k => k.toLowerCase() === title.toLowerCase());
  if (key && data[key] && data[key].image_url) return data[key].image_url as string;

  // Fallback: normalized comparison and substring includes
  const normalize = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  const normTitle = normalize(title);
  const keys = Object.keys(data);

  // Exact normalized match
  const exactNorm = keys.find(k => normalize(k) === normTitle);
  if (exactNorm && data[exactNorm]?.image_url) return data[exactNorm].image_url as string;

  // Substring contains: prefer longer keys to reduce false positives
  const candidates = keys
    .map(k => ({ k, nk: normalize(k) }))
    .filter(({ nk }) => nk.length >= 6 && (normTitle.includes(nk) || nk.includes(normTitle)));
  candidates.sort((a, b) => b.nk.length - a.nk.length);
  for (const c of candidates) {
    const v = data[c.k];
    if (v?.image_url) return v.image_url as string;
  }

  return null;
}
