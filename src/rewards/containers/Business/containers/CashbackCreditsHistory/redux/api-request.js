import { get } from '../../../../../../utils/api/api-fetch';

export const getCashbackHistoryList = async ({ customerId, business: merchantName, rewardType }) =>
  get('/api/v3/loyalty-change-logs', {
    queryParams: {
      customerId,
      merchantName,
      rewardType,
    },
  });

export const getStoreCreditsHistoryList = async ({ customerId, business: merchantName }) =>
  get('/api/v3/store-credits/history', {
    queryParams: {
      customerId,
      merchantName,
    },
  });
