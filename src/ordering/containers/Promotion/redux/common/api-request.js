import { post } from '../../../../../utils/api/api-fetch';

/**
 * Promotion part
 */
export const applyPromotion = ({ receiptNumber, promotionId, applyCashback }) => {
  const payload = { promotionId, applyCashback };
  return post(`/api/v3/transactions/${receiptNumber}/apply-promotions`, payload);
};

export const removePromotion = ({ receiptNumber }) => post(`/api/v3/transactions/${receiptNumber}/remove-promotions`);

/**
 * Voucher part
 */
export const applyVoucher = ({ receiptNumber, voucherCode, applyCashback }) => {
  const payload = { voucherCode, applyCashback };
  return post(`/api/v3/transactions/${receiptNumber}/apply-voucher`, payload);
};

export const removeVoucher = ({ receiptNumber }) => post(`/api/v3/transactions/${receiptNumber}/remove-voucher`);
