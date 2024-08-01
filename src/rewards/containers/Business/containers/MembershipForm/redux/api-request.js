import { get, post } from '../../../../../../utils/api/api-fetch';

export const getOrderRewards = async ({ receiptNumber, business, channel }) =>
  get(`/api/v3/transaction/${receiptNumber}/rewards`, {
    queryParams: {
      business,
      channel,
    },
  });
