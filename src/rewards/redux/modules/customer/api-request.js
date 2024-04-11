import { get } from '../../../../utils/api/api-fetch';

export const getCustomerInfo = ({ consumerId, business, pointsTotalEarned = false, rewardsTotal = false }) =>
  get(`/api/v3/consumers/${consumerId}/customer`, {
    queryParams: {
      business,
      pointsTotalEarned,
      rewardsTotal,
    },
  });
