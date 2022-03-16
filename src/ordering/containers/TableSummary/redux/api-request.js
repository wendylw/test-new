import { get, post } from '../../../../utils/api/api-fetch';

// fetch an order
export const fetchOrder = ({ receiptNumber }) => get(`/api/v3/transactions/${receiptNumber}`);

// post an order of cashback
export const fetchOrderIncludeCashback = ({ receiptNumber }) =>
  get(`/api/v3/transactions/${receiptNumber}/calculation`);

// fetch order submission status
export const fetchOrderSubmissionStatus = ({ receiptNumber }) => get(`/api/v3/transactions/${receiptNumber}/status`);

// confirm to pay for order
export const postOrderSubmitted = ({ receiptNumber, modifiedTime }) => {
  const payload = { modifiedTime };

  return post(`/api/v3/transactions/${receiptNumber}/submission`, payload);
};
