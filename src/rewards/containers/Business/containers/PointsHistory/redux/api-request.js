import { get } from '../../../../../../utils/api/api-fetch';

export const getPointsHistoryList = async ({ consumerId, business: merchantName, page, limit }) =>
  get('/api/v3/points/history', {
    queryParams: {
      consumerId,
      merchantName,
      page,
      limit,
    },
  });
