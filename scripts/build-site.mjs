// Builds the storefront into dist/site: generate pages, then copy media.
import { execFileSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
const OUT = 'dist/site';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
execFileSync(process.execPath, ['apps/site/src/build.js', OUT], { stdio: 'inherit' });
for (const dir of ['images', 'p', 'v']) {
  if (existsSync(`apps/site/${dir}`)) cpSync(`apps/site/${dir}`, `${OUT}/${dir}`, { recursive: true });
}
rmSync(`${OUT}/images/tips.jpg`, { force: true });
console.log('site ready in', OUT);
