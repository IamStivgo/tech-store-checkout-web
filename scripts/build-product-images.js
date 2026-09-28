// Builds the catalog images from the illustrations in design/product-illustrations/.
//   node scripts/build-product-images.js
// Writes public/images/products/<name>-<width>.<format>, the files the API seed points to
// (avif, webp and jpg at 320, 640 and 960 px).
import { mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const SOURCE_DIR = path.resolve(import.meta.dirname, '../design/product-illustrations');
const OUTPUT_DIR = path.resolve(import.meta.dirname, '../public/images/products');
const WIDTHS = [320, 640, 960];
const FORMATS = {
  avif: (image) => image.avif({ quality: 60 }),
  webp: (image) => image.webp({ quality: 80 }),
  jpg: (image) => image.jpeg({ quality: 82, mozjpeg: true }),
};

mkdirSync(OUTPUT_DIR, { recursive: true });
const sources = readdirSync(SOURCE_DIR).filter((file) => file.endsWith('.svg'));

for (const file of sources) {
  const name = path.basename(file, '.svg');
  for (const width of WIDTHS) {
    // Rendered at the target size, so every width stays sharp.
    const rendered = sharp(path.join(SOURCE_DIR, file), { density: (72 * width) / 640 }).resize(
      width,
      width,
    );
    for (const [format, encode] of Object.entries(FORMATS)) {
      await encode(rendered.clone()).toFile(path.join(OUTPUT_DIR, `${name}-${width}.${format}`));
    }
  }
}

console.log(`Built ${sources.length * WIDTHS.length * Object.keys(FORMATS).length} images`);
