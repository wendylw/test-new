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

const shouldFilter = (event, hint) => {
  try {
    return (
      isInfiniteScrollerBug(event, hint) ||
      isPromiseAllBug(event, hint) ||
      isBlockFrameBug(event, hint) ||
      isSelectedDebugHandlerError(event, hint) ||
      isChargeEventStructureInvalid(event, hint) ||
      isDuplicateChargeId(event, hint)
    );
  } catch {
    return false;
  }
};

export default shouldFilter;
