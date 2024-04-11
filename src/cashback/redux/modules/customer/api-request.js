import { get } from '../../../../utils/api/api-fetch';

export const getConsumerCustomerInfo = (consumerId, pointsTotalEarned = false, rewardsTotal = false) =>
  get(`/api/v3/consumers/${consumerId}/customer`, {
    queryParams: {
      pointsTotalEarned,
      rewardsTotal,
    },
  });
