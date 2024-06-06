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
