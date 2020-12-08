const shouldFilter = (event, hint) => {
  try {
    return isInfiniteScrollerBug(event) || isCrossStorageBug(event);
  } catch {
    return false;
  }
};

const isInfiniteScrollerBug = event => {
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

const isCrossStorageBug = event => {
  try {
    const err = event.exception.values[0];
    return /CrossStorage/i.test(err.value);
  } catch {
    return false;
  }
};

export default shouldFilter;
