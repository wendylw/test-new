import { stringMatchesSomePattern } from '@sentry/utils';
import { getEventFilterUrl } from './utils';

const isAllowedUrl = (event, allowUrls) => {
  // TODO: Use Glob instead?
  if (!allowUrls || !allowUrls.length) {
    return true;
  }
  const url = getEventFilterUrl(event);
  return !url ? true : stringMatchesSomePattern(url, allowUrls);
};

export default isAllowedUrl;
