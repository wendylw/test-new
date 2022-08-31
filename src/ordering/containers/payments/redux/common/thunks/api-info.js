import { post } from '../../../../../../utils/api/api-fetch';

export const API_INFO = {
  getPayments: (storeId, shippingType, amount) => ({
    url: '/payment/online/options',
    queryParams: { storeId, shippingType, amount },
  }),
};

// API for submit order and initPayment for all payment
export const initPaymentWithOrder = data => post('/payment/init-with-order', data);
