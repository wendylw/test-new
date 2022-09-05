import * as Sentry from '@sentry/react';
import { CaptureConsole } from '@sentry/integrations';
import tids from './tracing-id';
import shouldFilter, { getErrorMessageFromHint } from './filter-sentry-events';
import './navigation-detector';
import './click-detector';
import logger from './logger';
import { getAppPlatform, getAPIRequestRelativePath } from './utils';

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

class SentryCapturedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SentryCapturedError';
  }
}

const trackError = (event, hint) => {
  try {
    const errorMessage = getErrorMessageFromHint(hint);
    logger.error('Common_Error', { message: errorMessage, sentryId: event?.event_id });

    window.newrelic?.addPageAction('common.error', {
      message: errorMessage,
      sentryId: event?.event_id,
    });
  } catch (e) {
    console.log(e);
  }
};

const logUrlChange = type => {
  logger.log('Common_PageNavigation', {
    type,
    query: window.location.search,
  });
};

const logClientInfo = () => {
  logger.log('Common_ClientInfo', {
    userAgent: navigator.userAgent,
  });
};

window.addEventListener('sh-pushstate', () => {
  logUrlChange('pushstate');
});

window.addEventListener('sh-replacestate', () => {
  logUrlChange('replacestate');
});

window.addEventListener('popstate', () => {
  logUrlChange('popstate');
});

const logUserAction = (type, data) => {
  logger.log(type, data);
};

window.addEventListener('sh-click', e => {
  logUserAction('Common_Click', e.detail);
});

window.addEventListener('sh-api-success', e => {
  const { type: method, request: url, requestStart, status: httpStatusCode } = e.detail;
  const path = getAPIRequestRelativePath(url);

  logger.log(
    'Common_HttpRequest',
    {},
    {
      publicData: {
        httpInfo: {
          result: 'Succeed',
          method,
          url,
          path,
          responseTime: new Date().valueOf() - requestStart,
          httpStatusCode,
        },
      },
    }
  );
});

window.addEventListener('sh-api-failure', e => {
  const {
    type: method,
    request: url,
    requestStart,
    error: message,
    code: errorCode,
    status: httpStatusCode,
  } = e.detail;
  const path = getAPIRequestRelativePath(url);

  logger.error(
    'Common_HttpRequest',
    {},
    {
      publicData: {
        httpInfo: {
          result: 'Failed',
          method,
          url,
          path,
          responseTime: new Date().valueOf() - requestStart,
          httpStatusCode,
          errorCode,
          message,
        },
      },
    }
  );
});

window.addEventListener('sh-fetch-error', e => {
  const { type: method, request: url, requestStart, error: message } = e.detail;
  const path = getAPIRequestRelativePath(url);

  logger.error(
    'Common_HttpRequest',
    {},
    {
      publicData: {
        httpInfo: {
          result: 'Failed',
          method,
          url,
          path,
          responseTime: new Date().valueOf() - requestStart,
          httpStatusCode: 0,
          message,
        },
      },
    }
  );
});

const initiallyLogged = false;

if (!initiallyLogged) {
  logUrlChange('pageloaded');
  logClientInfo();
}
