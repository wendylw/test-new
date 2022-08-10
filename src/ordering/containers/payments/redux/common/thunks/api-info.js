import { post } from '../../../../../../utils/api/api-fetch';

export const API_INFO = {
  getPayments: (storeId, shippingType, amount) => ({
    url: '/payment/online/options',
    queryParams: { storeId, shippingType, amount },
  }),
  getSavedCardList: (userId, paymentProvider) => ({
    url: `/api/consumers/${userId}/paymentMethods`,
    queryParams: { provider: paymentProvider },
  }),
};

// API for submit order and initPayment for all payment
export const initPaymentWithOrder = data => post('/payment/init-with-order', data);
