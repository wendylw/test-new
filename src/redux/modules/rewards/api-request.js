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

export const postApplyVoucher = ({ fulfillDate, shippingType, code: voucherCode }) =>
  post('/api/cart/applyVoucher', {
    fulfillDate,
    shippingType,
    voucherCode,
  });

export const postApplyPayLaterPromo = ({ receiptNumber, id: promotionId, uniquePromotionCodeId: promotionCodeId }) =>
  post(`/api/v3/transactions/${receiptNumber}/apply-promotions`, {
    promotionId,
    promotionCodeId,
  });

export const postApplyPayLaterVoucher = ({ receiptNumber, code: voucherCode }) =>
  post(`/api/v3/transactions/${receiptNumber}/apply-voucher`, { voucherCode });
