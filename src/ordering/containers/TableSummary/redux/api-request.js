import { get } from '../../../../utils/api/api-fetch';

// fetch an order
export const fetchOrder = ({ receiptNumber }) => get(`/api/v3/transactions/${receiptNumber}`);

// post an order of cashback
export const fetchOrderIncludeCashback = ({ receiptNumber }) =>
  get(`/api/v3/transactions/${receiptNumber}/calculation`);

// fetch order submission status
export const fetchOrderSubmissionStatus = ({ receiptNumber }) => get(`/api/v3/transactions/${receiptNumber}/status`);
