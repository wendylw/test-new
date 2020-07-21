import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    ignoreErrors: [],
    integrations: [new CaptureConsole({ levels: ['error', 'assert'] })],
    attachStacktrace: true,
  });

  // inject xhr and fetch to inspect error
  const originXHROpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function() {
    const url = arguments[1];
    this.addEventListener('load', function() {
      if (this.status >= 500) {
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
      if (resp.status >= 500) {
        Sentry.withScope(scope => {
          scope.setFingerprint(['{{default}}', resp.url]);
          Sentry.captureException(new Error(`Encountered server error on url ${resp.url}`));
        });
      }
      return resp;
    });

    return promise;
  };
}
