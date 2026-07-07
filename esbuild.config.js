const esbuild = require('esbuild');
const path = require('path');

const handlers = [
  'createOrder',
  'getOrder',
  'listOrders',
  'deleteOrder',
  'processOrder',
];

async function build() {
  const entryPoints = handlers.map((name) => ({
    in: path.join('src', 'handlers', `${name}.ts`),
    out: path.join('dist', name),
  }));

  await esbuild.build({
    entryPoints: entryPoints.map((e) => e.in),
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    sourcemap: true,
    external: ['@aws-sdk/*'],
    outExtension: { '.js': '.js' },
    entryNames: '[name]',
  });

  console.log('Build complete:', handlers.join(', '));
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
