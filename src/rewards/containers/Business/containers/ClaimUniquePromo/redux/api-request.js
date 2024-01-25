import { post } from '../../../../../../utils/api/api-fetch';

export const postClaimUniquePromo = ({ id, consumerId, source, business: businessName }) =>
  post(`/api/v3/rewards-sets/${id}/redeem`, {
    consumerId,
    source,
    businessName,
  });
