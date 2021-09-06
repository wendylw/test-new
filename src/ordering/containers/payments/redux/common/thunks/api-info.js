import { get } from '../../../../../../utils/api/api-fetch';

export const API_INFO = {
  getPayments: () => ({
    url: '/payment/online/options',
  }),
  getSavedCardList: (userId, paymentProvider) => ({
    url: `/api/consumers/${userId}/paymentMethods`,
    queryParams: { provider: paymentProvider },
  }),
};

export const getPaymentDetails = orderId => get('/payment/details', { queryParams: { orderId } });
