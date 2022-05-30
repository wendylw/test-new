import { post } from '../../../../../utils/api/api-fetch';

export const applyPromotion = ({ receiptNumber, promotionId }) => {
  const payload = { promotionId };
  return post(`/api/v3/transactions/${receiptNumber}/apply-promotions`, payload);
};

export const removePromotion = ({ receiptNumber }) => post(`/api/v3/transactions/${receiptNumber}/remove-promotions`);
