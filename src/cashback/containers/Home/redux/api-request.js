import { get } from '../../../../utils/api/api-fetch';

export const getReceiptList = (business, page, pageSize) =>
  get('/api/transactions', {
    queryParams: {
      business,
      page,
      pageSize,
    },
  });
