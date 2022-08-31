import _isEmpty from 'lodash/isEmpty';
import { isTNGMiniProgram, isAndroidWebview, isIOSWebview } from '../../common/utils';
import { API_REQUEST_URL_PATTERNS } from './constants';

export const getIsDebugMode = () => process.env.NODE_ENV === 'development';

export const getUUID = () => {
  try {
    return crypto.randomUUID();
  } catch {
    // Our application is not mission-critical, so Broofa's answer is good enough for us as a backup plan since it is pretty slick and effective.
    /* eslint-disable */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    /* eslint-enable */
  }
};

export const getAppPlatform = () => {
  if (isTNGMiniProgram()) {
    return 'tng-mini-program';
  }

  return isAndroidWebview() ? 'android' : isIOSWebview() ? 'ios' : 'web';
};

export const getAPIRequestRelativePath = path => {
  // Remove query parameters to reduce unnecessary match patterns.
  const filteredQueryPath = path.split('?')[0];
  // Try to match the wildcards by URL patterns.
  const entry = Object.entries(API_REQUEST_URL_PATTERNS).find(([_, pattern]) => pattern.test(filteredQueryPath));

  if (!_isEmpty(entry)) {
    const [wildcardPath, _] = entry;
    return wildcardPath;
  }

  // If we detect the path that matches known dynamic field patterns, remind devs to add the rule to API_REQUEST_URL_PATTERNS.
  // Currently we found 4 patterns and can be summarized as follows:
  // 1. Mongo object id: 62da7c6cc54471000742c9ab
  // 2. UUID: 6b90fa58-c088-4ef2-8389-1e31bed0fb3d
  // 3. Encoded hash: %2FNgSNqSiqLKugrwIw%2BrsvcGLo9AFP1KILG6SGoqi5xQ%3D%0A
  // 4. Inappropriate fields: null (undefined?)
  const dynamicFieldPatterns = /\/([a-f\d]{24,}|\W+|\d+|null|undefined)\/?/i;
  const hasWildcardHit = dynamicFieldPatterns.test(filteredQueryPath);
  const isDebugMode = getIsDebugMode();
  const shouldShowWarning = hasWildcardHit && isDebugMode;

  if (shouldShowWarning) {
    console.warn(`seems like you miss adding '${path}' to wildcard patterns, please take a look.`);
  }

  return filteredQueryPath;
};
