import { get } from '../../../../../../utils/api/api-fetch';

export const getCashbackCreditsHistoryList = async ({ consumerId, business: merchantName }) =>
  get('/api/v3/points/history', {
    queryParams: {
      consumerId,
      merchantName,
    },
  });
