import _get from 'lodash/get';

export const getErrorMessageFromHint = ({ originalException, syntheticException }) => {
  if (typeof originalException === 'string') {
    return originalException;
  }
  return originalException?.message || syntheticException?.message || 'UnknownSentryErrorMessage';
};

export const getErrorStacktraceFrames = event => {
  const values = event.exception.values;
  const frames = event.stacktrace?.frames || [];

  if (values && values.length > 0) {
    return frames.concat(values[0].stacktrace?.frames || []);
  }

  return frames;
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
    const contextNoMethodFuncIssue = getErrorStacktraceFrames(event).some(
      ({ filename, abs_path }) => tiktokRegex.test(filename) || tiktokRegex.test(abs_path)
    );

    return monitorIssue || chunkLoadFailed || contextNoMethodFuncIssue;
  } catch {
    return false;
  }
};

const isReCAPTCHAIssues = (event, hint) => {
  // These issues cause by reCAPTCHA script.
  try {
    // WB-4596: The errors thrown directly from reCAPTCHA script should be ignored.
    // Reasons: They are not harmful to Beep and also cannot be fixed by our side.
    // Refer to: https://kibana.pro.mymyhub.com/_plugin/kibana/goto/f9dc1773113db0e1e8882dd0e7322588?security_tenant=global
    const recaptchaRegex = /https:\/\/www.gstatic.com\/recaptcha/;
    const isScriptIssue = getErrorStacktraceFrames(event).some(({ filename }) => recaptchaRegex.test(filename));

    // BEEP-2657: The errors thrown indirectly from reCAPTCHA script should be ignored.
    // Reasons: They are not harmful to Beep and also cannot be fixed by our side.
    // Refer to: https://github.com/getsentry/sentry-javascript/issues/2514#issuecomment-603971338
    const message = getErrorMessageFromHint(hint);
    const type = _get(event, 'exception.values[0].type', null);
    const isTimeoutIssue = message.includes('Timeout') && type === 'UnhandledRejection';

    return isScriptIssue || isTimeoutIssue;
  } catch {
    return false;
  }
};

const isGoogleMapsIssues = (event, hint) => {
  // These issues cause by Google Maps script.
  try {
    // WB-4239 & WB-4931: The errors thrown directly from Google Map script should be ignored.
    // Reasons: They are mostly network errors and also cannot be fixed by our side.
    // Refer to: https://developers.google.com/maps/documentation/javascript/place-id#refresh-id
    const googleMapsRegex = /https:\/\/maps.googleapis.com/;
    const isScriptIssue = getErrorStacktraceFrames(event).some(({ filename }) => googleMapsRegex.test(filename));

    // BEEP-1710 & BEEP-1947: The errors thrown indirectly from Google Map script should be ignored.
    // Reasons: This problem is duplicated since it only occurs when Google Maps API is undefined. However, we have already logged the Google Maps API load failure case.
    const isNullPropertyIssue = isReadGoogleMapsPropertiesFromNullIssues(event, hint);

    return isScriptIssue || isNullPropertyIssue;
  } catch {
    return false;
  }
};

const isCleverTapIssues = (event, hint) => {
  // These issues are raised by CleverTap script.
  try {
    // WB-5086 & WB-5087: The errors thrown directly from CleverTap script should be ignored.
    // Reasons: They are mostly raised intentionally by CleverTap to avoid further security risks. Nothing can be done on our side.
    // Refer to: https://github.com/CleverTap/clevertap-web-sdk/blob/5cf459521e5b83213e9a2d0e59b7e5000a5cbcbb/clevertap.js#L1347
    const cleverTapRegex = /\/js\/clevertap.min.js/;
    const isScriptIssue = getErrorStacktraceFrames(event).some(({ filename }) => cleverTapRegex.test(filename));

    return isScriptIssue;
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

const isDuplicateAlert = hint => {
  // alert duplicate is expectation issue
  // so we can ignore it.
  try {
    const message = getErrorMessageFromHint(hint);
    return message.includes('Failed to create alert: id existed');
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
      isReCAPTCHAIssues(event, hint) ||
      isGoogleMapsIssues(event, hint) ||
      isCleverTapIssues(event, hint) ||
      isVivoAdblockProblem(event, hint) ||
      isDuplicateAlert(hint)
    );
  } catch {
    return false;
  }
};

export default shouldFilter;
