#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function extractTitles(tsPath) {
  const src = fs.readFileSync(tsPath, 'utf8');
  const re = /title:\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push(m[1]);
  }
  return out;
}

(function main() {
  const productsPath = path.resolve('src/data/products.ts');
  const titles = extractTitles(productsPath);
  const outPath = path.resolve('data/product_titles.txt');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, titles.join('\n'));
  console.log(`Wrote ${titles.length} titles to ${outPath}`);
})();
