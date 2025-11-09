import { build } from 'esbuild';

const watch = process.argv.includes('--watch');

const common = {
  bundle: true,
  sourcemap: true,
  format: 'iife',
  target: 'es2020',
  platform: 'browser'
};

async function run() {
  await build({
    entryPoints: ['src/code.ts'],
    outfile: 'dist/code.js',
    ...common,
    watch
  });
  console.log(watch ? 'Watching…' : 'Built dist/code.js');
}

run();
