import { get, post } from '../../../../../utils/api/api-fetch';

export const fetchStoreFavStatus = ({ consumerId, storeId }) =>
  get(`/api/consumers/${consumerId}/favorites/stores/${storeId}/status`);

export const saveStoreFavStatus = ({ consumerId, storeId, isFavorite }) =>
  post(`/api/consumers/${consumerId}/favorites/stores/${storeId}/status`, { isFavorite });

// This API is used to notify BFF to update __h, __s, and __t properties of the cookies.
export const updateStoreInfoCookies = h => post(`/api/ordering/stores/selected?h=${h}`);
