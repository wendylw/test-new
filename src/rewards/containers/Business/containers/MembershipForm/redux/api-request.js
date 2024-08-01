import { get, post } from '../../../../../../utils/api/api-fetch';

export const getOrderRewards = async ({ receiptNumber, business, channel }) =>
  get(`/api/v3/transaction/${receiptNumber}/rewards`, {
    queryParams: {
      business,
      channel,
    },
  });

export const postClaimedOrderPointsCashback = async ({ receiptNumber, business, channel }) =>
  post(`/api/v3/transaction/${receiptNumber}/membership`, {
    queryParams: {
      business,
      channel,
    },
  });
