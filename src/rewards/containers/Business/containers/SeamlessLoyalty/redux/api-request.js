import { patch } from '../../../../../../utils/api/api-fetch';

export const patchSharingConsumerInfo = ({ requestId, source, business: businessName }) =>
  patch(`/api/v3/share-info-requests/${requestId}`, { source, businessName });
