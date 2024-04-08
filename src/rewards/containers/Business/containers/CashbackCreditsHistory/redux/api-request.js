import { get } from '../../../../../../utils/api/api-fetch';

export const getCashbackHistoryList = async ({ consumerId, business: merchantName }) =>
  get('/api/cashback/history', {
    queryParams: {
      consumerId,
      merchantName,
    },
  });

export const getStoreCreditsHistoryList = async ({ consumerId, business: merchantName }) =>
  get('/api/v3/store-credits/history', {
    queryParams: {
      consumerId,
      merchantName,
    },
  });
