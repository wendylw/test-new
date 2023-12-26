import { post, patch } from '../../../../../../utils/api/api-fetch';

export const patchSharingConsumerInfo = ({ requestId, source }) =>
  patch(`/api/v3/share-info-requests/${requestId}`, { source });

export const postSharingConsumerInfoToMerchant = requestId =>
  post(`/api/v3/share-info-requests/${requestId}/confirmation`);
