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
      event.extra.arguments[0].type === 'scroll'
    );
  } catch {
    return false;
  }
};

const isCrossStorageBug = (event, hint) => {
  // Some browsers doesn't support cross storage. This is a known issue and will be fixed soon. We
  // turn off the log to prevent it taking the sentry quota.
  try {
    const message = getErrorMessageFromHint(hint);
    return /CrossStorage/i.test(message);
  } catch {
    return false;
  }
};

const isCrossStorageCloseBug = (event, hint) => {
  try {
    const err = event.exception.values[0];
    return /Closing client\. Could not access localStorage in hub/.test(err.value);
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

const shouldFilter = (event, hint) => {
  try {
    return (
      isInfiniteScrollerBug(event, hint) ||
      isCrossStorageBug(event, hint) ||
      isCrossStorageCloseBug(event, hint) ||
      isPromiseAllBug(event, hint) ||
      isBlockFrameBug(event, hint)
    );
  } catch {
    return false;
  }
};

export default shouldFilter;
