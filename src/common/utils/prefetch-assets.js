import { isSafari } from './index';
import i18next from '../../i18n';

// Only Safari doesn't support link prefetching mechanism by default
// Refer to https://caniuse.com/link-rel-prefetch
const supportRelPrefetch = !isSafari();

const createPrefetchLink = href => {
  const as = href.endsWith('.css') ? 'style' : href.endsWith('.js') ? 'script' : href.endsWith('json') ? 'fetch' : null;
  const link = document.createElement('link');
  link.rel = supportRelPrefetch ? 'prefetch' : 'preload';
  link.href = href;
  link.className = 'custom-prefetch';
  if (as) {
    link.as = as;
  }
  return link;
};

const loadedChunkAssets = new Set();

const loadedI18nAssets = new Set();

const hasChunkLoaded = href => {
  if (loadedChunkAssets.has(href)) {
    return true;
  }
  const cssSet = new Set(
    Array.from(document.styleSheets)
      .map(css => css.href)
      .filter(url => !!url)
  );
  if (href.endsWith('.css')) {
    if (cssSet.has(href)) {
      loadedChunkAssets.add(href);
      return true;
    }
  }
  const jsSet = new Set(
    Array.from(document.scripts)
      .map(script => script.src)
      .filter(url => !!url)
  );
  if (href.endsWith('.js')) {
    if (jsSet.has(href)) {
      loadedChunkAssets.add(href);
      return true;
    }
  }
  return false;
};

const prefetchI18nFile = i18nName => {
  const { I18N_FOLDER_PATH_MAPPING } = window;

  if (!I18N_FOLDER_PATH_MAPPING) return;

  let i18nFileHref = null;

  Object.entries(I18N_FOLDER_PATH_MAPPING).forEach(([namespace, filePath]) => {
    const filePathWithOrigin = namespace.startsWith('/') ? `${window.location.origin}${filePath}` : filePath;
    if (new RegExp(`\\b${i18nName}\\b`).test(namespace)) {
      if (!loadedI18nAssets.has(filePathWithOrigin)) {
        i18nFileHref = filePathWithOrigin;
        loadedI18nAssets.add(filePathWithOrigin);
      }
      i18nFileHref = filePathWithOrigin;
    }
  });

  if (i18nFileHref) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createPrefetchLink(i18nFileHref));
    document.head.appendChild(fragment);
  }
};

const prefetchAssets = chunkName => {
  const { ASSETS_MANIFEST } = window;
  if (!ASSETS_MANIFEST) return;
  let parentChunkName;
  if (chunkName.includes('_')) {
    [parentChunkName] = chunkName.split('_');
  }
  const assetList = [];
  Object.entries(ASSETS_MANIFEST).forEach(([assetChunkName, assetPath]) => {
    const assetPathWithOrigin = assetPath.startsWith('/') ? `${window.location.origin}${assetPath}` : assetPath;
    if (
      new RegExp(`\\b${chunkName}\\b`).test(assetChunkName) ||
      (parentChunkName && new RegExp(`\\b${parentChunkName}\\b`).test(assetChunkName))
    ) {
      if (!hasChunkLoaded(assetPathWithOrigin)) {
        assetList.push(assetPathWithOrigin);
        loadedChunkAssets.add(assetPathWithOrigin);
      }
    }
  });
  if (assetList.length > 0) {
    const fragment = document.createDocumentFragment();
    assetList.forEach(href => {
      fragment.appendChild(createPrefetchLink(href));
    });
    document.head.appendChild(fragment);
  }
};

const prefetch = (chunkNames, i18nNames) => {
  const run = () => {
    try {
      chunkNames.forEach(prefetchAssets);
      i18nNames.forEach(prefetchI18nFile);
      if (i18nNames) {
        i18next.loadNamespaces(i18nNames);
      }
    } catch (e) {
      console.error('Failed to prefetch assets', e);
    }
  };
  if (window.requestIdleCallback) {
    window.requestIdleCallback(run);
  } else {
    setTimeout(run, 5000);
  }
};

export default prefetch;
