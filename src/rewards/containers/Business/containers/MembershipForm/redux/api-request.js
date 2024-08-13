import { get } from '../../../../../../utils/api/api-fetch';

export const getOrderRewards = async ({ receiptNumber, business: merchantName, channel }) =>
  get(`/api/v3/transaction/${receiptNumber}/rewards-estimation`, {
    queryParams: {
      merchantName,
      channel,
    },
  });
