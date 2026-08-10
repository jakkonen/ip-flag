import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const target = process.argv[2];
if (target !== 'chromium' && target !== 'firefox') {
  throw new Error('Usage: tsx scripts/write-manifest.ts <chromium|firefox>');
}

const readJson = async (path: string) => JSON.parse(await readFile(path, 'utf8'));

const base = await readJson(resolve('manifests/base.json'));
const pkg = await readJson(resolve('package.json'));
base.version = pkg.version;
const specific = await readJson(resolve(`manifests/${target}.json`));
const manifest = { ...base, ...specific };

await writeFile(
  resolve(`dist/${target}/manifest.json`),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

console.log(`manifest.json written for ${target}`);
