export const getErrorMessageFromHint = ({ originalException, syntheticException }) => {
  if (typeof originalException === 'string') {
    return originalException;
  }
  return originalException?.message || syntheticException?.message || 'UnknownSentryErrorMessage';
};

const isInfiniteScrollerBug = (event, hint) => {
  try {
    const err = event.exception.values[0];
    return (
      /null is not an object \(evaluating '\w+\.scrollHeight'\)/.test(err.value) &&
      err.mechanism.data.handler === 'bound scrollListener'
    );
  } catch {
    return false;
  }
};

const isCrossStorageBug = (event, hint) => {
  try {
    const message = getErrorMessageFromHint(hint);
    return /CrossStorage/i.test(message);
  } catch {
    return false;
  }
};

const shouldFilter = (event, hint) => {
  try {
    return isInfiniteScrollerBug(event, hint) || isCrossStorageBug(event, hint);
  } catch {
    return false;
  }
};

export default shouldFilter;
