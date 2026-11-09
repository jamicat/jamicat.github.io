import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { transform } from 'esbuild';

const require = createRequire(import.meta.url);

execFileSync(process.execPath, [
  require.resolve('tailwindcss/lib/cli.js'),
  '-c', './tailwind.config.cjs',
  '-i', './tailwind.input.css',
  '-o', './static/tailwind.generated.css',
  '--minify'
], { stdio: 'inherit' });

const manifest = {};
for (const name of ['scripts', 'discscripts', 'chat']) {
  const source = await readFile(`static/${name}.js`, 'utf8');
  const result = await transform(source, {
    loader: 'js',
    target: 'esnext',
    minifyWhitespace: true,
    minifyIdentifiers: false,
    minifySyntax: false,
    legalComments: 'none',
    charset: 'utf8'
  });
  await writeFile(`static/${name}.min.js`, result.code);
  const version = createHash('sha256').update(result.code).digest('hex').slice(0, 12);
  manifest[name] = `${name}.min.js?v=${version}`;
  const reduction = (100 * (1 - Buffer.byteLength(result.code) / Buffer.byteLength(source))).toFixed(1);
  process.stdout.write(`${name}.js: ${reduction}% smaller before compression\n`);
}

await mkdir('data', { recursive: true });
await writeFile('data/assetmanifest.json', JSON.stringify(manifest));
execFileSync('hugo', [], { stdio: 'inherit' });
