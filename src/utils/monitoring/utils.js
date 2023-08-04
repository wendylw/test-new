import _isEmpty from 'lodash/isEmpty';
import { isTNGMiniProgram, isAndroidWebview, isIOSWebview } from '../../common/utils';
import { API_REQUEST_URL_PATTERNS, API_URL_WARNING_BYPASS_LIST } from './constants';

export const getIsDebugMode = () => process.env.NODE_ENV === 'development';

export const getAppPlatform = () => {
  if (isTNGMiniProgram()) {
    return 'tng-mini-program';
  }

  return isAndroidWebview() ? 'android' : isIOSWebview() ? 'ios' : 'web';
};

export const getAPIRequestRelativePath = path => {
  // Remove protocol & hostname from the path
  // Refer to: https://stackoverflow.com/a/54947757
  const filteredHostnamePath = path.replace(/^(https?:\/\/)*[^/]+/, '');

  // Remove query parameters to reduce unnecessary match patterns.
  const filteredQueryPath = filteredHostnamePath.split('?')[0];
  // Try to match the wildcards by URL patterns.
  // eslint-disable-next-line no-unused-vars
  const entry = Object.entries(API_REQUEST_URL_PATTERNS).find(([_, pattern]) => pattern.test(filteredQueryPath));

  if (!_isEmpty(entry)) {
    // eslint-disable-next-line no-unused-vars
    const [wildcardPath, _] = entry;
    return wildcardPath;
  }

  const isInBypassList = API_URL_WARNING_BYPASS_LIST.includes(filteredQueryPath);

  if (isInBypassList) {
    return filteredQueryPath;
  }

  // If we detect the path that matches known dynamic field patterns, remind devs to add the rule to API_REQUEST_URL_PATTERNS.
  // Currently we found 5 patterns and can be summarized as follows:
  // 1. Mongo object id: 62da7c6cc54471000742c9ab
  // 2. UUID: 6b90fa58-c088-4ef2-8389-1e31bed0fb3d
  // 3. Transaction id: 544516540905750
  // 4. Encoded hash: %2FNgSNqSiqLKugrwIw%2BrsvcGLo9AFP1KILG6SGoqi5xQ%3D%0A
  // 5. Inappropriate fields: null (undefined?)
  const dynamicFieldPatterns = /\/([^/]{24,}|\d+|null|undefined)\/?/;
  const hasWildcardHit = dynamicFieldPatterns.test(filteredQueryPath);
  const isDebugMode = getIsDebugMode();
  const shouldShowWarning = hasWildcardHit && isDebugMode;

  if (shouldShowWarning) {
    // eslint-disable-next-line no-console
    console.warn(`seems like you miss adding '${path}' to wildcard patterns, please take a look.`);
  }

  return filteredQueryPath;
};
