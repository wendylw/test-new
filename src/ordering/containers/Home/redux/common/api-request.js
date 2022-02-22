import * as ApiFetch from '../../../../../utils/api/api-fetch';

export const getAlcoholConsent = () => ApiFetch.get('/api/v3/alcohol/consent/acknowledge');
export const setAlcoholConsent = () => ApiFetch.post('/api/v3/alcohol/consent/acknowledge');
export const getStoreSaveStatus = ({ consumerId, storeId }) =>
  ApiFetch.get(`/api/consumers/${consumerId}/favorites/stores/${storeId}/status`);
export const setStoreSaveStatus = ({ consumerId, storeId }) =>
  ApiFetch.post(`/api/consumers/${consumerId}/favorites/stores/${storeId}/status`);
