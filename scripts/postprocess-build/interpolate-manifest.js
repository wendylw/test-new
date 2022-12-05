const debug = require('debug')('postprocess:interpolate-manifest');

const interpolateManifest = (html, manifest) => {
  const files = {};

  console.log('[postprocess-build] Start adding asset-manifest into HTML...');

  Object.entries(manifest.files).forEach(([chunkName, assetPath]) => {
    if (chunkName.endsWith('.js') || chunkName.endsWith('.css')) {
      files[chunkName] = assetPath;
    }
  });

  const output = `<script id="ASSETS_MANIFEST_SCRIPT">window.ASSETS_MANIFEST = ${JSON.stringify(files)};</script>`;
  debug(output);

  console.log('[postprocess-build] Finished adding asset-manifest into HTML.');

  return html.replace('<script id="ASSETS_MANIFEST_PLACEHOLDER"></script>', output);
};

module.exports = interpolateManifest;