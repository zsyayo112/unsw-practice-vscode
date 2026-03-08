// @ts-check
const esbuild = require('esbuild');

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const extensionConfig = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  sourcemap: !isProduction,
  minify: isProduction,
  logLevel: 'info',
};

/** @type {import('esbuild').BuildOptions} */
const webviewConfig = {
  entryPoints: ['src/webview/main.ts'],
  bundle: true,
  outfile: 'out/webview/main.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  sourcemap: !isProduction,
  minify: isProduction,
  logLevel: 'info',
};

/**
 * Run both build targets, optionally in watch mode.
 */
async function main() {
  if (isWatch) {
    const [extCtx, webCtx] = await Promise.all([
      esbuild.context(extensionConfig),
      esbuild.context(webviewConfig),
    ]);
    await Promise.all([extCtx.watch(), webCtx.watch()]);
    console.warn('Watching for changes — Ctrl+C to stop.');
  } else {
    await Promise.all([
      esbuild.build(extensionConfig),
      esbuild.build(webviewConfig),
    ]);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
