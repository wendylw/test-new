import { get, post } from '../../../utils/api/api-fetch';

export const getOfferList = ({ search, shippingType, merchantName }) =>
  get('/api/v3/offers', {
    queryParams: {
      search,
      shippingType,
      merchantName,
    },
  });

export const getOfferDetail = ({ id, uniquePromotionCodeId, type }) =>
  get(`/api/v3/offers/${id}`, {
    queryParams: {
      uniquePromotionCodeId,
      type,
    },
  });

export const postApplyPromo = ({ id: promoId, fulfillDate, shippingType, uniquePromotionCodeId }) =>
  post('/api/cart/applyPromoCode', {
    promoId,
    fulfillDate,
    shippingType,
    uniquePromotionCodeId,
  });

export const postApplyVoucher = ({ shippingType, voucherCode, applyCashback }) =>
  post('/api/cart/applyVoucher', {
    shippingType,
    voucherCode,
    applyCashback,
  });
