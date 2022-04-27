export const getErrorMessageFromHint = ({ originalException, syntheticException }) => {
  if (typeof originalException === 'string') {
    return originalException;
  }
  return originalException?.message || syntheticException?.message || 'UnknownSentryErrorMessage';
};

const isInfiniteScrollerBug = (event, hint) => {
  // This error happens when the user make a fast slide and navigate to another page before the animation
  // stops. This seems to be a bug on ios safari. And it won't affect real user.
  try {
    const err = event.exception.values[0];
    return (
      /null is not an object \(evaluating '\w+\.scrollHeight'\)/.test(err.value) &&
      event.extra.arguments.length &&
      event.extra.arguments[0].type &&
      event.extra.arguments[0].target
    );
  } catch {
    return false;
  }
};

const isPromiseAllBug = (event, hint) => {
  // we are keeping receiving this Promise.all is not a function, but it seems that the clients are
  // very likely spiders (mostly from United States and Ireland). So just ignore the error.
  try {
    const err = event.exception.values[0];
    return /Promise\.all is not a function/.test(err.value);
  } catch {
    return false;
  }
};

const isBlockFrameBug = (event, hint) => {
  // Facebook browser seems not supporting cross storage. We will abandon cross storage anyway. We
  // turn off the log to prevent it taking the sentry quota.
  try {
    const err = event.exception.values[0];
    return /Blocked a frame with origin.*from accessing a cross-origin frame/.test(err.value);
  } catch {
    return false;
  }
};

const isSelectedDebugHandlerError = (event, hint) => {
  // Sometimes this error happens on some safari browser:
  // undefined is not an object (evaluating 'window.webkit.messageHandlers.selectedDebugHandler.postMessage')
  // It's not related to our code. And we didn't find too much clue, but it seems the user can keep operating
  // as normal. Some times this error occurs hundreds of time in one minute and cause a spike on sentry.
  try {
    const err = event.exception.values[0];
    return /window\.webkit\.messageHandlers\.selectedDebugHandler\.postMessage/.test(err.value);
  } catch {
    return false;
  }
};

const isChargeEventStructureInvalid = (event, hint) => {
  try {
    const message = getErrorMessageFromHint(hint);
    return /Charged event structure invalid\. Not sent\./.test(message);
  } catch {
    return false;
  }
};

const isDuplicateChargeId = (event, hint) => {
  try {
    const message = getErrorMessageFromHint(hint);
    return /Duplicate Charged Id/.test(message);
  } catch {
    return false;
  }
};

const isTokenExpired = (event, hint) => {
  // this issue always happened in ordering menu page because the tokens passed by app side would
  // expired in a short time
  try {
    const message = getErrorMessageFromHint(hint);
    return /Token Expired/.test(message);
  } catch {
    return false;
  }
};

const isGoogleAnalytics = event => {
  // null is not an object (evaluating 'g.readyState') from https://www.google-analytics.com/analytics.js
  try {
    const err = event.exception.values[0];
    return /null is not an object \(evaluating 'g\.readyState'\)/.test(err.value);
  } catch {
    return false;
  }
};

const isIgnoreObjectNotFoundMatchingId = (event, hint) => {
  // it seems to be a error caused by Microsoft's crawler. Refer to: https://forum.sentry.io/t/unhandledrejection-non-error-promise-rejection-captured-with-value/14062,
  // so we can ignore it.
  try {
    const message = getErrorMessageFromHint(hint);
    return message.includes('Object Not Found Matching Id');
  } catch {
    return false;
  }
};

const isTikTokIssues = (event, hint) => {
  // These issues cause by tiktok monitoring script.
  try {
    const message = getErrorMessageFromHint(hint);
    const tiktokRegex = /^https:\/\/analytics.tiktok.com/;

    // If error message includes `sendAnalyticsEvent not support`, this error is from `tiktok analysis` issue instead of beep issue.
    const monitorIssue = /sendAnalyticsEvent not support/.test(message);
    // In this case, the chunk file of tiktok failed to load, not because of the failure to load the Beep file.
    const chunkLoadFailed = tiktokRegex.test(message) && /Loading chunk/.test(message);
    // If abs_path or filename of stacktrace includes tiktok i18n events path, exception will response `ePageWillLeave=function(){var t,n;Object.keys(this.context.methods.getUserInfo())` on /i18n/pixel/events.js
    const contextNoMethodFuncIssue = [
      ...event.exception.values[0].stacktrace.frames,
      ...event.stacktrace.frames,
    ].some(({ filename, abs_path }) => tiktokRegex.test(filename || abs_path));

    return monitorIssue || chunkLoadFailed || contextNoMethodFuncIssue;
  } catch {
    return false;
  }
};

const isVivoAdblockProblem = (event, hint) => {
  // BEEP-1622: This problem only occurs on Vivo browser. Seems to be a problem with Vivo's adblock service.
  try {
    const message = getErrorMessageFromHint(hint);
    return message.includes('privateSpecialRepair is not defined');
  } catch {
    return false;
  }
};

const isReadGoogleMapsPropertiesFromNullIssues = (event, hint) => {
  // BEEP-1710 & BEEP-1947: This problem is duplicated since it only occurs when Google Maps API is undefined. However, we have already logged the Google Maps API load failure case.
  try {
    const message = getErrorMessageFromHint(hint);
    const readGoogleMapsPropertiesFromNullIssues = [
      /Cannot read property 'LatLng' of null/,
      /Cannot read properties of null \(reading 'LatLng'\)/,
      /null is not an object \(evaluating 'new \w\.LatLng'\)/,
      /Cannot read property 'places' of null/,
      /Cannot read properties of null \(reading 'places'\)/,
      /null is not an object \(evaluating 'new \w\.places'\)/,
    ];
    return readGoogleMapsPropertiesFromNullIssues.some(issue => issue.test(message));
  } catch {
    return false;
  }
};

const shouldFilter = (event, hint) => {
  try {
    return (
      isInfiniteScrollerBug(event, hint) ||
      isPromiseAllBug(event, hint) ||
      isBlockFrameBug(event, hint) ||
      isSelectedDebugHandlerError(event, hint) ||
      isChargeEventStructureInvalid(event, hint) ||
      isDuplicateChargeId(event, hint) ||
      isTokenExpired(event, hint) ||
      isGoogleAnalytics(event) ||
      isIgnoreObjectNotFoundMatchingId(event, hint) ||
      isTikTokIssues(event, hint) ||
      isVivoAdblockProblem(event, hint) ||
      isReadGoogleMapsPropertiesFromNullIssues(event, hint)
    );
  } catch {
    return false;
  }
};

export default shouldFilter;
