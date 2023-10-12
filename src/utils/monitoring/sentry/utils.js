import _get from 'lodash/get';
import { getEventDescription } from '@sentry/utils';
import { getIsDebugMode } from '../utils';
import logger from '../logger';

export const getErrorMessageFromHint = ({ originalException, syntheticException }) => {
  if (typeof originalException === 'string') {
    return originalException;
  }
  return originalException?.message || syntheticException?.message || 'UnknownSentryErrorMessage';
};

export const getErrorTypeFromHint = ({ originalException }) => {
  if (typeof originalException === 'string') {
    return originalException;
  }

  return originalException?.name || 'UnknownSentryErrorType';
};

export const getIsErrorExceptionValueFromEvent = (event, value) => {
  const { values } = event.exception;
  const exceptionValue = values.find(valueItem => valueItem.value === value);

  return !!exceptionValue;
};

export const getErrorStacktraceFrames = event => {
  const { values } = event.exception;
  const frames = event.stacktrace?.frames || [];

  if (values && values.length > 0) {
    return frames.concat(values[0].stacktrace?.frames || []);
  }

  return frames;
};

export const isRelativePath = url =>
  // https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
  !/^(?:[a-z]+:)?\/\//.test(url);

export const getAllowUrls = () => {
  const allowUrls = [window.location.origin];
  const publicUrl = process.env.PUBLIC_URL;
  // NOTE: local env PUBLIC_URL is empty string, and if allow url is string, if the url includes the string, we will consider it hits the allowUrl, and won't drop the url
  // so the allowUrl can't be empty string
  if (publicUrl) {
    allowUrls.push(publicUrl);
  }
  return allowUrls;
};

/* eslint-disable  */
// TIPS: source code: https://github.com/getsentry/sentry-javascript/tree/develop/packages/utils
// because the source code is only meant to be used sentry package internally, and as such is not part of sentry's public API contract and does not follow semver. so we copy it
function _getLastValidUrl(frames = []) {
  for (let i = frames.length - 1; i >= 0; i--) {
    const frame = frames[i];

    if (frame && frame.filename !== '<anonymous>' && frame.filename !== '[native code]') {
      return frame.filename || null;
    }
  }

  return null;
}

export function getEventFilterUrl(event) {
  try {
    let frames;
    try {
      // @ts-ignore we only care about frames if the whole thing here is defined
      frames = event.exception.values[0].stacktrace.frames;
    } catch (e) {
      // ignore
    }
    return frames ? _getLastValidUrl(frames) : null;
  } catch (oO) {
    if (getIsDebugMode()) {
      logger.warn(`Cannot extract url for event ${getEventDescription(event)}`);
    }
    return null;
  }
}
/* eslint-enable */

export const trackError = (event, hint, isSentToSentry) => {
  try {
    const errorMessage = getErrorMessageFromHint(hint);
    const sentryId = _get(event, 'event_id', 'unknown');

    logger.error('Common_SentryCapturedError', {
      message: errorMessage,
      id: sentryId,
      isSentToSentry,
      source: getEventFilterUrl(event),
    });

    window.newrelic?.addPageAction('common.error', {
      message: errorMessage,
      sentryId,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};
