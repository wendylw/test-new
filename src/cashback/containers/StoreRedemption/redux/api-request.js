import { post, patch } from '../../../../utils/api/api-fetch';

export const patchShareConsumerInfoRequests = (requestId, sharingConsumerInfo) =>
  patch(`/api/v3/share-info-requests/${requestId}`, sharingConsumerInfo);

export const postShareConsumerInfoRequests = requestId => post(`/api/v3/share-info-requests/${requestId}/confirmation`);
