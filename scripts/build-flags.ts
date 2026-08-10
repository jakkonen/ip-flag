import { mkdir, readdir, access } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import sharp from 'sharp';

const SOURCE = resolve('node_modules/flag-icons/flags/4x3');
const OUT = resolve('public/flags');
const SIZES = [16, 32];

await access(SOURCE);
const files = (await readdir(SOURCE)).filter((name) => name.endsWith('.svg'));

for (const file of files) {
  const countryCode = basename(file, '.svg').toLowerCase();
  const source = resolve(SOURCE, file);

  for (const size of SIZES) {
    const rectangleDir = resolve(OUT, 'rectangle', String(size));
    const roundDir = resolve(OUT, 'round', String(size));
    await mkdir(rectangleDir, { recursive: true });
    await mkdir(roundDir, { recursive: true });

    await sharp(source)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(resolve(rectangleDir, `${countryCode}.png`));

    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
    );

    await sharp(source)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(resolve(roundDir, `${countryCode}.png`));
  }
}

console.log(`Built ${files.length} flags in rectangle and round styles`);
