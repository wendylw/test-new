import { get } from './api/api-fetch';

const SHORTEN_URL_MAP = new Map();

const fetchShortUrl = url =>
  get('/api/shrink', {
    queryParams: {
      url,
    },
  });

export const shortenUrl = async url => {
  if (!SHORTEN_URL_MAP.has(url)) {
    const fetchShortUrlPromise = fetchShortUrl(url);

    SHORTEN_URL_MAP.set(url, fetchShortUrlPromise);

    fetchShortUrlPromise.catch(() => {
      SHORTEN_URL_MAP.delete(url);
    });
  }

  return SHORTEN_URL_MAP.get(url);
};
