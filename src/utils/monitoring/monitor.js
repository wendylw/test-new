import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';
import tids from './tracing-id';
import shouldFilter, { getErrorMessageFromHint } from './filter-sentry-events';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    ignoreErrors: [],
    integrations: [new CaptureConsole({ levels: ['error', 'assert'] })],
    attachStacktrace: true,
    environment: process.env.NODE_ENV,
    beforeSend: (event, hint) => {
      if (shouldFilter(event, hint)) {
        return null;
      }
      trackError(event, hint);
      return event;
    },
  });
}

// inject xhr and fetch to inspect error
const isRelativePath = url => {
  // https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
  return !/^(?:[a-z]+:)?\/\//.test(url);
};
const originXHROpen = window.XMLHttpRequest.prototype.open;
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
    window.heap?.addEventProperties({ [key]: tid });

    if (key === 'perm_tid') {
      Sentry.setUser({ [key]: tid });
      window.heap?.addUserProperties({ [key]: tid });
    }
  });
} catch (e) {
  console.log(e);
}

class SentryCapturedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SentryCapturedError';
  }
}

const trackError = (event, hint) => {
  try {
    const errorMessage = getErrorMessageFromHint(hint);
    window.heap?.track('common.error', { errorMessage, sentryId: event?.event_id });
    try {
      throw new SentryCapturedError(errorMessage);
    } catch (err) {
      window.newrelic?.noticeError(err, { sentryId: event?.event_id });
    }
  } catch (e) {
    console.log(e);
  }
};
