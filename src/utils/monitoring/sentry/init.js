import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';
import { shouldFilterEvent, shouldDropEvent } from './inbound-filters';
import { trackError, isRelativePath, getAllowUrls } from './utils';
import { getAppPlatform, getIsDebugMode } from '../utils';
import tids from '../tracing-id';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    ignoreErrors: [],
    integrations: [new CaptureConsole({ levels: ['error', 'assert'] })],
    attachStacktrace: true,
    environment: process.env.NODE_ENV,
    debug: getIsDebugMode(),
    initialScope: {
      tags: { ...tids, app_plt: getAppPlatform() },
      user: { perm_tid: tids.perm_tid },
    },
    beforeSend: (event, hint) => {
      // Case 1: We will filter it entirely, neither send it to Sentry nor Kibana.
      const shouldFilter = shouldFilterEvent(event, hint);

      if (shouldFilter) {
        return null;
      }

      // Case 2: We will drop it from Sentry, but still send it to Kibana.
      const shouldDrop = shouldDropEvent(event, {
        allowUrls: getAllowUrls(),
      });

      trackError(event, hint, !shouldDrop);

      if (shouldDrop) {
        return null;
      }

      return event;
    },
  });
}

// inject xhr and fetch to inspect error
const originXHROpen = window.XMLHttpRequest.prototype.open;
/* eslint-disable prefer-rest-params, func-names */
window.XMLHttpRequest.prototype.open = function() {
  const url = arguments[1];
  this.addEventListener('load', function() {
    if (isRelativePath(url) && this.status >= 500) {
      Sentry.withScope(scope => {
        scope.setFingerprint(['{{default}}', url]);
        Sentry.captureException(new Error(`Encountered server error on url ${url}`));
      });
    }
  });
  originXHROpen.apply(this, arguments);
};
/* eslint-disable */

const originFetch = window.fetch;
window.fetch = function fetch(...args) {
  var promise = originFetch(...args).then(resp => {
    const { url } = resp;
    if (isRelativePath(url) && resp.status >= 500) {
      Sentry.withScope(scope => {
        scope.setFingerprint(['{{default}}', url]);
        Sentry.captureException(new Error(`Encountered server error on url ${url}`));
      });
    }
    return resp;
  });

  return promise;
};

// add global tracing id
try {
  Object.keys(tids).forEach(key => {
    const tid = tids[key];
    window.newrelic?.setCustomAttribute(key, tid);
    Sentry.setTag(key, tid);

    if (key === 'perm_tid') {
      Sentry.setUser({ [key]: tid });
    }
  });
  const platform = getAppPlatform();
  window.newrelic?.setCustomAttribute('app_plt', platform);
  Sentry.setTag('app_plt', platform);
} catch (e) {
  console.log(e);
}
