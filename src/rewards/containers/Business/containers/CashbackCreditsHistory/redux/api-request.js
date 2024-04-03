import { get } from '../../../../../../utils/api/api-fetch';

export const getCashbackCreditsHistoryList = async ({ consumerId, business: merchantName, rewardType, page, limit }) =>
  get('http://127.0.0.1:4523/m1/2755399-0-default/api/v3/points/history', {
    queryParams: {
      consumerId,
      merchantName,
      rewardType,
      page,
      limit,
    },
  });
