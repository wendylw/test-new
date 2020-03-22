/**
 * This is a temporary solution to generate name with hash for i18n files,
 * so that the browser can always get latest version.
 */
const fs = require('fs-extra');
const path = require('path');
const debug = require('debug')('build-i18n-files');
const crypto = require('crypto');

const BUILD_FOLDER_NAME = 'build';
const SRC_FOLDER_NAME = 'locales';
const DEST_FOLDER_NAME = 'i18n';

const isFolderSync = filePath => {
  try {
    var stat = fs.lstatSync(filePath);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    debug('isFolderSync error: %s', e.message);
    return false;
  }
};

const traverseFolder = async (folderPath, callback) => {
  debug('traverseFolder in %s', folderPath);
  const content = await fs.readdir(folderPath);
  const promises = content.map(async fileName => {
    const filePath = path.join(folderPath, fileName);
    if (isFolderSync(filePath)) {
      debug('will execute traverseFolder recursively in %s', filePath);
      return traverseFolder(filePath, callback);
    } else {
      return callback(filePath);
    }
  });
  return Promise.all(promises);
};

const calculateHash = str => {
  const hash = crypto.createHash('md5');
  hash.update(str, 'utf8');
  return hash.digest('hex');
};

const main = async () => {
  const rootPath = __dirname;
  const buildPath = path.join(rootPath, BUILD_FOLDER_NAME);
  const localeSrcPath = path.join(buildPath, SRC_FOLDER_NAME);
  const destRootPath = path.join(buildPath, DEST_FOLDER_NAME);
  const i18nMapping = {};

  try {
    await traverseFolder(localeSrcPath, async fileFullPath => {
      const relativePath = path.relative(localeSrcPath, fileFullPath);
      if (fileFullPath.endsWith('.json')) {
        const data = await fs.readJSON(fileFullPath, { encoding: 'utf8' });
        debug('%s: JSON read', relativePath);

        const jsonString = JSON.stringify(data, null, 0);
        const hash = calculateHash(jsonString).substring(0, 16);
        debug('%s: hash generated: hash', relativePath, hash);

        const destRelPath = relativePath.replace(/\.json$/, `.${hash}.json`);
        await fs.outputFile(path.join(destRootPath, destRelPath), jsonString);
        debug('%s: file generated', relativePath);

        const i18nKey = relativePath.replace(/\.json$/, '');
        i18nMapping[i18nKey] = `/i18n/${destRelPath}`;
      }
    });
    debug('all i18n files is generated %j', i18nMapping);

    const indexHtmlPath = path.join(buildPath, 'index.html');

    let indexHtml = await fs.readFile(indexHtmlPath, { encoding: 'utf8' });
    debug('file loaded from indexHtmlPath');
    const injectedScript = `window.I18N_FOLDER_PATH_MAPPING = ${JSON.stringify(i18nMapping)};`;
    indexHtml = indexHtml.replace(
      '<script id="I18N_FOLDER_PATH_SCRIPT"></script>',
      `<script id="I18N_FOLDER_PATH_SCRIPT">${injectedScript}</script>`
    );
    if (!indexHtml.includes(injectedScript)) {
      throw new Error('Failed to inject script.');
    }
    await fs.writeFile(indexHtmlPath, indexHtml);
    debug('file written to indexHtmlPath');
    console.log('I18N files is built successfully.');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

main();
