import * as ApiFetch from '../../../utils/api/api-fetch';

export const fetchOrderHistory = ({ consumerId, page, pageSize }) =>
  ApiFetch.get(`/api/consumers/${consumerId}/transactions`, {
    queryParams: {
      page,
      pageSize,
    },
  });
