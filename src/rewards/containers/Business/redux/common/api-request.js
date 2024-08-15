import { get, post } from '../../../../../utils/api/api-fetch';

export const postSharingConsumerInfoToMerchant = ({ requestId, business: businessName }) =>
  post(`/api/v3/share-info-requests/${requestId}/confirmation`, { businessName });

export const getUniquePromoList = async ({ consumerId, business }) =>
  get(`/api/v3/consumers/${consumerId}/unique-promos`, {
    queryParams: {
      business,
    },
  });

export const getUniquePromoListBanners = async ({ consumerId, business, limit }) =>
  get(`/api/v3/consumers/${consumerId}/unique-promos/banners`, {
    queryParams: {
      business,
      limit,
    },
  });

export const getPointsRewardList = async ({ consumerId, business: merchantName }) =>
  get(`/api/v3/points/rewards`, {
    queryParams: {
      consumerId,
      merchantName,
    },
  });

export const postClaimedPointsReward = async ({ consumerId, business: merchantName, id }) =>
  post(
    `/api/v3/points/rewards`,
    {
      id,
      merchantName,
    },
    {
      queryParams: {
        consumerId,
        merchantName,
      },
    }
  );

export const postClaimedOrderRewards = async ({ receiptNumber, business: merchantName, channel, storeId, source }) =>
  post(`/api/v3/transactions/${receiptNumber}/rewards`, {
    queryParams: {
      merchantName,
      channel,
      storeId,
      source,
    },
  });
