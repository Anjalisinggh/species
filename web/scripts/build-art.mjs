// Converts the original paintings in art-src/ (named <species-slug>-<stage>.png) into web-sized
// WebP files in public/art/ and writes the manifest the app uses to decide when a painting exists.
import sharp from 'sharp';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';

const src = new URL('../art-src/', import.meta.url), out = new URL('../public/art/', import.meta.url);
mkdirSync(out, { recursive: true });
const names = readdirSync(src).filter((f) => /^[a-z0-9-]+-[0-3]\.(png|jpe?g|webp)$/i.test(f)).sort();
const keys = [];
for (const f of names) {
  const key = f.replace(/\.\w+$/, '').toLowerCase();
  const img = sharp(new URL(f, src).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  await img.clone().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 82 }).toFile(new URL(`${key}.webp`, out).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  await img.clone().resize({ width: 640 }).webp({ quality: 78 }).toFile(new URL(`${key}-sm.webp`, out).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
  keys.push(key);
}
writeFileSync(new URL('../src/lib/art-manifest.json', import.meta.url), JSON.stringify(keys, null, 2) + '\n');
console.log(`${keys.length} paintings:`, keys.join(', '));
