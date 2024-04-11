import { get } from '../../../../../../utils/api/api-fetch';

export const getPointsHistoryList = async ({ customerId, business: merchantName }) =>
  get('/api/v3/points/history', {
    queryParams: {
      customerId,
      merchantName,
    },
  });
