import _isObject from 'lodash/isObject';

export const API_INFO = {
  getStores: (businessName, storeId) => ({
    url: `/api/stores/${businessName}${storeId ? `/${storeId}` : ''}`,
  }),
};

export function isHttpSuccess(status) {
  if (status < 400) {
    return true;
  }

  return false;
}

export function assembleUrl(url, queryParams) {
  let result = url;

  try {
    if (queryParams && _isObject(queryParams)) {
      let query = Object.keys(queryParams)
        .filter(key => queryParams[key])
        .map(key => `${key}=${queryParams[key]}`)
        .join('&');

      result = `${url}?${query}`;
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      /* eslint-disable */
      console.error(`url: '${url}'`, e);
      /* eslint-enable */
    }
  }

  return result;
}