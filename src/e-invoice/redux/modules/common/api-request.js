import { get } from '../../../../utils/api/api-fetch';

export const getEInvoiceStatus = ({ h, merchantName, receiptNumber, channel }) =>
  get(`/api/v3/e-invoices/status`, {
    queryParams: {
      h,
      merchantName,
      receiptNumber,
      channel,
    },
  });

export const getEInvoiceSubmissionDetail = ({ h, merchantName, receiptNumber, channel }) =>
  get(`/api/v3/e-invoices/submission-details`, {
    queryParams: {
      h,
      merchantName,
      receiptNumber,
      channel,
    },
  });
