import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { transform } from 'esbuild';

const require = createRequire(import.meta.url);

execFileSync(process.execPath, [
  require.resolve('tailwindcss/lib/cli.js'),
  '-c', './tailwind.config.cjs',
  '-i', './tailwind.input.css',
  '-o', './tailwind.generated.css',
  '--minify'
], { stdio: 'inherit' });

let html = await readFile('index.html', 'utf8');

for (const name of ['scripts', 'discscripts', 'chat']) {
  const source = await readFile(`${name}.js`, 'utf8');
  const result = await transform(source, {
    loader: 'js',
    target: 'esnext',
    minifyWhitespace: true,
    minifyIdentifiers: false,
    minifySyntax: false,
    legalComments: 'none',
    charset: 'utf8'
  });
  const filename = `${name}.min.js`;
  await writeFile(filename, result.code);
  const version = createHash('sha256').update(result.code).digest('hex').slice(0, 12);
  const pattern = new RegExp(`(\\bsrc=["'])${name}\\.js(?:\\?[^"']*)?(["'])`, 'g');
  let matches = 0;
  html = html.replace(pattern, (_, prefix, suffix) => {
    matches++;
    return `${prefix}${filename}?v=${version}${suffix}`;
  });
  if (matches !== 1) {
    throw new Error(`Expected one script reference for ${name}.js, found ${matches}`);
  }
  const reduction = (100 * (1 - Buffer.byteLength(result.code) / Buffer.byteLength(source))).toFixed(1);
  process.stdout.write(`${name}.js: ${reduction}% smaller before compression\n`);
}

await writeFile('index.html', html);
