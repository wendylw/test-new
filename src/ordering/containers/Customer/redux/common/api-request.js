import * as ApiFetch from '../../../../../utils/api/api-fetch';

export const fetchAddressList = (consumerId, storeId) => {
  const endPoint = `/api/consumers/${consumerId}/store/${storeId}/address`;

  return ApiFetch.get(endPoint);
};
