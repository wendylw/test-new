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

    // If no in the set, return false to skip the js checking
    return false;
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

const hasI18nLoaded = href => {
  if (loadedI18nAssets.has(href)) {
    return true;
  }

  // i18n links will probably be inserted in the following cases:
  // 1. During the build time - we use the 'custom-preload' class name to track the links
  // 2. After the page is mounted - we use the 'custom-prefetch' class name to track the links
  // Given that, we only need to include the first case in our possible set
  const set = new Set(
    document
      .getElementsByClassName('custom-preload')
      .map(link => link.href)
      .filter(url => !!url)
      .filter(url => url.endsWith('.json'))
  );

  if (set.has(href)) {
    loadedI18nAssets.add(href);
    return true;
  }

  return false;
};

const prefetchI18nFiles = i18nName => {
  const { I18N_FOLDER_PATH_MAPPING } = window;

  if (!I18N_FOLDER_PATH_MAPPING) return;

  let i18nFileHref = null;

  Object.entries(I18N_FOLDER_PATH_MAPPING).forEach(([namespace, filePath]) => {
    const filePathWithOrigin = `${window.location.origin}${filePath}`;
    if (new RegExp(`\\b${i18nName}\\b`).test(namespace)) {
      if (!hasI18nLoaded(filePathWithOrigin)) {
        i18nFileHref = filePathWithOrigin;
        loadedI18nAssets.add(filePathWithOrigin);
      }
    }
  });

  if (i18nFileHref) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createPrefetchLink(i18nFileHref));
    document.head.appendChild(fragment);
  }
};

const prefetchChunkFiles = chunkName => {
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
      chunkNames.forEach(prefetchChunkFiles);
      i18nNames.forEach(prefetchI18nFiles);
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
