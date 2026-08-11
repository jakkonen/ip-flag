import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const OUT = resolve('public/icons');
const SOURCE = resolve('assets/icon-location.png');
const SIZES = [16, 32, 48, 128];

const suppliedSource = process.argv[2];

if (suppliedSource) {
  await mkdir(resolve('assets'), { recursive: true });
  await sharp(suppliedSource)
    .trim({ background: '#ffffff', threshold: 12 })
    .resize(512, 512, { fit: 'contain', background: '#ffffff' })
    .png()
    .toFile(SOURCE);
}

await mkdir(OUT, { recursive: true });

for (const size of SIZES) {
  await sharp(SOURCE)
    .resize(size, size)
    .png()
    .toFile(resolve(OUT, `icon-${size}.png`));
}

console.log(`Built ${SIZES.length} icons from the location mark source`);
