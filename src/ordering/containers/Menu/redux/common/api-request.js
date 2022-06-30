import { get, post } from '../../../../../utils/api/api-fetch';

export const fetchStoreFavStatus = ({ consumerId, storeId }) =>
  get(`/api/consumers/${consumerId}/favorites/stores/${storeId}/status`);

export const saveStoreFavStatus = ({ consumerId, storeId, isFavorite }) =>
  post(`/api/consumers/${consumerId}/favorites/stores/${storeId}/status`, { isFavorite });
