import { post, patch } from '../../../../../../utils/api/api-fetch';

export const patchSharingConsumerInfo = (requestId, sharingConsumerInfo) =>
  patch(`/api/v3/share-info-requests/${requestId}`, sharingConsumerInfo);

export const postSharingConsumerInfoToMerchant = requestId =>
  post(`/api/v3/share-info-requests/${requestId}/confirmation`);
