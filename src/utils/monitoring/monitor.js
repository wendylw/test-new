import { onFCP, onCLS, onFID, onLCP, onTTFB } from 'web-vitals';
import './navigation-detector';
import './click-detector';
import './sentry/init';
import logger from './logger';
import { getAPIRequestRelativePath } from './utils';

const logUrlChange = type => {
  logger.log('Common_PageNavigation', {
    type,
    query: window.location.search,
  });
};

const logClientInfo = () => {
  logger.log('Common_ClientInfo', {
    name: navigator.userAgent,
  });
};

const logWebVitalInfo = metric => {
  /**
   * According to type specification, we only need to record following values:
   * 1. name: the name of the metric
   * 2. value: the current value of the metric
   * 3. rating: the rating as to whether the metric value is within the "good", "needs improvement", or "poor" thresholds of the metric
   * 4. navigationType: the type of navigation
   */
  const { name, value, rating, navigationType } = metric || {};

  logger.log('Common_WebVitalInfo', {
    name,
    value,
    rating,
    navigationType,
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

const trackWebVitals = () => {
  try {
    onTTFB(logWebVitalInfo);
    onFCP(logWebVitalInfo);
    onLCP(logWebVitalInfo);
    onCLS(logWebVitalInfo);
    onFID(logWebVitalInfo);
  } catch (e) {
    // Note: always be careful! the script could throw errors for unknown reasons
    // Refer to: https://github.com/GoogleChrome/web-vitals/issues/274
    logger.error('Common_TrackWebVitalsFailed', { message: e?.message });
  }
};

// WB-4701: support reporting web vitals to log server
trackWebVitals();
