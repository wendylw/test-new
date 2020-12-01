import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    ignoreErrors: [],
    integrations: [new CaptureConsole({ levels: ['error', 'assert'] })],
    attachStacktrace: true,
    environment: process.env.NODE_ENV,
    beforeSend: (event, hint) => {
      if (isInfiniteScrollerBug(event)) {
        return null;
      }
      return event;
    },
  });

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
}

const isInfiniteScrollerBug = event => {
  try {
    const err = event.exception.values[0];
    debugger;
    return (
      /null is not an object \(evaluating '\w+\.scrollHeight'\)/.test(err.value) &&
      err.mechanism.data.handler === 'bound scrollListener'
    );
  } catch {
    return false;
  }
};
