import { get, post } from '../../../../../../utils/api/api-fetch';

export const API_INFO = {
  getSavedCardList: (userId, paymentProvider) => ({
    url: `/api/consumers/${userId}/paymentMethods`,
    queryParams: { provider: paymentProvider },
  }),
};

// get payment options
export const getPayments = (storeId, shippingType, amount) =>
  get('/payment/online/options', { queryParams: { storeId, shippingType, amount } });

// API for submit order and initPayment for all payment
export const initPaymentWithOrder = data => post('/payment/init-with-order', data);
