import { post } from '../../../../../utils/api/api-fetch';

/**
 * Promotion part
 */
export const applyPromotion = ({ receiptNumber, promotionId }) => {
  const payload = { promotionId };

  return post(`/api/v3/transactions/${receiptNumber}/apply-promotions`, payload);
};

export const removePromotion = ({ receiptNumber }) => post(`/api/v3/transactions/${receiptNumber}/remove-promotions`);

/**
 * Voucher part
 */
export const applyVoucher = ({ receiptNumber, voucherCode }) => {
  const payload = { voucherCode };
  return post(`/api/v3/transactions/${receiptNumber}/apply-voucher`, payload);
};

export const removeVoucher = ({ receiptNumber }) => post(`/api/v3/transactions/${receiptNumber}/remove-voucher`);
