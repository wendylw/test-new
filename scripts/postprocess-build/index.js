require('dotenv').config();

const debug = require('debug')('postprocess:index');
const fs = require('fs-extra');
const path = require('path');
const interpolateI18N = require('./interpolate-i18n');
const interpolatePreload = require('./interpolate-preload');
const interpolateManifest = require('./interpolate-manifest');

const buildPath = path.join(__dirname, '../../build');

const processHtml = async () => {
  console.log('[postprocess-build] Start processing HTML...');

  try {
    let indexHtml = await interpolateI18N(buildPath);
    debug('after interpolateI18N: %s', indexHtml);

    let manifest = fs.readJSONSync(path.join(buildPath, 'asset-manifest.json'), 'utf8');
    indexHtml = interpolatePreload(indexHtml, manifest);
    debug('after interpolatePreload: %s', indexHtml);

    indexHtml = interpolateManifest(indexHtml, manifest);
    debug('after interpolateManifest: %s', indexHtml);

    fs.writeFileSync(path.join(buildPath, 'index.html'), indexHtml, 'utf8');

    console.log('[postprocess-build] Finished processing HTML.');
  } catch (e) {
    console.error('[postprocess-build] Failed to process HTML.', e);
    process.exit(1);
  }
};

processHtml();