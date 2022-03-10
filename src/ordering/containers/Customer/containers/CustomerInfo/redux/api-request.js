import * as ApiFetch from '../../../../../../utils/api/api-fetch';

export const fetchAddressDetails = (consumerId, storeId, savedAddressId) =>
  ApiFetch.get(`/api/consumers/${consumerId}/store/${storeId}/address/${savedAddressId}`);
