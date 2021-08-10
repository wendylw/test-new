import * as ApiFetch from '../../../../../utils/api/api-fetch';

export const fetchAddressList = (consumerId, storeId) =>
  ApiFetch.get(`/api/consumers/${consumerId}/store/${storeId}/address`);
