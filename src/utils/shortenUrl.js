/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable camelcase */
import { fetchShortUrl } from './api-request';
import * as NativeMethods from './native-methods';

const SHORTEN_URL_MAP = new Map();

const useShareLink = (url, storeName, t) => {
  const para = {
    link: `${url}`,
    title: t('shareTitle', { storeName }),
  };
  NativeMethods.shareLink(para);
};

export const shortenUrl = async url => {
  if (!SHORTEN_URL_MAP.has(url)) {
    const fetchShortUrlPromise = fetchShortUrl(url);

    SHORTEN_URL_MAP.set(url, fetchShortUrlPromise);

    fetchShortUrlPromise.catch(error => {
      console.error(`failed to share store link: ${error.message}`);
      SHORTEN_URL_MAP.delete(url);
    });
  }

  SHORTEN_URL_MAP.get(url);
};

export const getShareLinkUrl = async (storeName, t) => {
  const storeUrl = window.location.href;
  const shareLinkUrl = `${storeUrl}&source=SharedLink&utm_source=store_link&utm_medium=share`;

  if (SHORTEN_URL_MAP.get(shareLinkUrl)) {
    const { url_short } = await SHORTEN_URL_MAP.get(shareLinkUrl);
    useShareLink(url_short, storeName, t);
  } else {
    const url_short = await shortenUrl(shareLinkUrl);
    useShareLink(url_short, storeName, t);
  }
};
