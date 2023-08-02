import * as ApiFetch from '../../../../utils/api/api-fetch';

export const fetchAddressList = consumerId => ApiFetch.get(`/api/consumers/${consumerId}/address`);

export const fetchWithStoreDistanceStatusAddressList = (consumerId, storeId) =>
  ApiFetch.get(`/api/consumers/${consumerId}/store/${storeId}/address`);

export const updateAddress = ({ consumerId, addressId, contactName, contactNumber }) =>
  ApiFetch.put(`/api/consumers/${consumerId}/address/${addressId}`, {
    contactName,
    contactNumber,
  });
