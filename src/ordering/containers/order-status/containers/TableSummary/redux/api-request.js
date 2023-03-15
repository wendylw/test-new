import { post } from '../../../../../../utils/api/api-fetch';

// If total === 0, it will lock order at table summary page
export const submitOrder = (receiptNumber, data) => post(`/api/v3/transactions/${receiptNumber}/submission`, data);

export const applyCashback = receiptNumber => post(`/api/v3/transactions/${receiptNumber}/apply-cashback`);

export const unapplyCashback = receiptNumber => post(`/api/v3/transactions/${receiptNumber}/remove-cashback`);
