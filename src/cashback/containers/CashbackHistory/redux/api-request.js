import { get } from '../../../../utils/api/api-fetch';

export const getCashbackHistoryList = customerId =>
  get('/api/cashback/history', {
    queryParams: { customerId },
  });
