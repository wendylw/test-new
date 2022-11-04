const debug = require('debug')('postprocess:preload');
const fs = require('fs-extra');
const path = require('path');

/**
 * Top 5 viewed pages on Beep plus the most viewed page on each URL entry
 * Refer to: https://kibana.mymyhub.com/goto/c729d67754f73281698e50c27895de79
 */
const PRELOADED_CHUNK_IDS = [
  'ORD_MNU',   // /ordering
  'ORD_SC',    // /ordering/cart
  'ORD_PMT',  // /ordering/payment
  'ORD_TY',    // /ordering/thank-you
  'ORD_PL',    // /ordering/login
  'SITE_HM',   // /home
  'CB_CL',     // /loyalty/claim
];

const PRELOADED_I18N_BY_PAGE = {
  ORD_MNU: ['OrderingHome'],
  ORD_SC: ['OrderingCart', 'OrderingPromotion'],
  ORD_PMT: ['OrderingPayment'],
  ORD_TY: ['OrderingThankYou'],
  ORD_PL: [],
  SITE_HM: [],
  CB_CL: ['Cashback'],
};

const PRELOADED_COMMON_I18N = ['Common', 'ApiError'];

const { PUBLIC_URL = '' } = process.env;

let i18nLocaleFilenames = [];

// Cache the i18n locales for better build performance
const getI18nLocales = () => {
  if (!!i18nLocaleFilenames) {
    i18nLocaleFilenames = fs.readdirSync(path.resolve(__dirname, '../../build/i18n'));
    return i18nLocaleFilenames;
  }

  return i18nLocaleFilenames;
};

const getI18nFiles = () => {
  const i18nFiles = {};
  const i18nLocales = getI18nLocales();

  i18nLocales.forEach(locale => {
    i18nFiles[locale] = {};

    const languageFiles = fs.readdirSync(path.resolve(__dirname, '../../build/i18n', locale));

    languageFiles.forEach(fileName => {
      const fileNameFirstPart = fileName.split('.')[0];
      i18nFiles[locale][fileNameFirstPart] = fileName;
    });
  });

  debug('i18nFiles: %o', i18nFiles);
  return i18nFiles;
};

const generateLinkTag = url => {
  const as = url.endsWith('.js') ? 'script' : url.endsWith('.css') ? 'style' : 'fetch';
  return `<link rel="preload" href="${url}" as="${as}" ${as === 'fetch' ? 'crossorigin' : ''}/>`;
};

const generatePreloadTags = manifest => {
  const preloadTagsByPageAndLanguage = {};
  const i18nLocales = getI18nLocales();
  const i18nFiles = getI18nFiles();

  PRELOADED_CHUNK_IDS.forEach(preloadChunkName => {
    i18nLocales.forEach(locale => {
      preloadTagsByPageAndLanguage[`${locale}/${preloadChunkName}`] = [];
      const preloadArray = preloadTagsByPageAndLanguage[`${locale}/${preloadChunkName}`];

      // common i18n
      PRELOADED_COMMON_I18N.forEach(id => {
        const i18nFilename = i18nFiles[locale][id];
        if (i18nFilename) {
          preloadArray.push(generateLinkTag(`${PUBLIC_URL}/i18n/${locale}/${i18nFilename}`));
        }
      });

      // page level i18n
      PRELOADED_I18N_BY_PAGE[preloadChunkName].forEach(id => {
        const i18nFilename = i18nFiles[locale][id];
        if (i18nFilename) {
          preloadArray.push(generateLinkTag(`${PUBLIC_URL}/i18n/${locale}/${i18nFilename}`));
        }
      });

      // js and css
      Object.entries(manifest.files).forEach(([chunkName, fileName]) => {
        if (!/\.(js|css)$/.test(chunkName)) return;
        let parentChunkName;
        if (preloadChunkName.includes('_')) {
          parentChunkName = preloadChunkName.split('_')[0];
        }
        if (
          new RegExp(`\\b${preloadChunkName}\\b`).test(chunkName) ||
          (parentChunkName && new RegExp(`\\b${parentChunkName}\\b`).test(chunkName))
        ) {
          debug('%s, %s', preloadChunkName, chunkName);
          const tag = generateLinkTag(fileName);
          preloadArray.push(tag);
        }
      });
    });
  });

  debug('preloadTagsByPageAndLanguage: %O', preloadTagsByPageAndLanguage);
  return preloadTagsByPageAndLanguage;
};

const interpolatePreload = (html, manifest) => {
  console.log('[postprocess-build] Start adding preload tags into HTML...');

  const preloadTagsByPageAndLanguage = generatePreloadTags(manifest);

  const output = Object.entries(preloadTagsByPageAndLanguage)
    .map(([key, tags]) => {
      return `<!--[PRELOAD:${key}] ${tags.join('')}-->`;
    })
    .join('');

  debug('output: \n%s', output);

  console.log('[postprocess-build] Finished adding preload tags into HTML.');

  return html.replace('<script id="PRELOAD_LINKS_PLACEHOLDER"></script>', output);
};

module.exports = interpolatePreload;