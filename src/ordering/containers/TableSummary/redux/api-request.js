import { get, post } from '../../../../utils/api/api-fetch';

// post an order of cashback
export const fetchOrderIncludeCashback = ({ receiptNumber }) =>
  get(`/api/v3/transactions/${receiptNumber}/calculation`);

// fetch order submission status
export const fetchOrderSubmissionStatus = ({ receiptNumber }) => get(`/api/v3/transactions/${receiptNumber}/status`);

// If total === 0, it will lock order at table summary page
export const submitOrder = (receiptNumber, data) => post(`/api/v3/transactions/${receiptNumber}/submission`, data);
