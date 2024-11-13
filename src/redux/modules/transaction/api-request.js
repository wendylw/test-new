import { get, post } from '../../../utils/api/api-fetch';

export const getOrderRewards = async ({ receiptNumber, business: merchantName, channel }) =>
  get(`/api/v3/transactions/${receiptNumber}/rewards-estimation`, {
    queryParams: {
      merchantName,
      channel,
    },
  });

export const postClaimedOrderRewards = async ({ receiptNumber, business: merchantName, channel, storeId, source }) =>
  post(`/api/v3/transactions/${receiptNumber}/rewards`, {
    merchantName,
    channel,
    storeId,
    source,
  });
