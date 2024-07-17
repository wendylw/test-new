import { get } from '../../../../utils/api/api-fetch';

export const getEInvoice = ({ h, merchantName, receiptNumber, channel }) =>
  get('/api/v3/e-invoices', {
    queryParams: {
      h,
      merchantName,
      receiptNumber,
      channel,
    },
  });
