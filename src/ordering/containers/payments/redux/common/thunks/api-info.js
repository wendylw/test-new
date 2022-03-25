import { post } from '../../../../../../utils/api/api-fetch';

export const API_INFO = {
  getPayments: (storeId, shippingType) => ({
    url: '/payment/online/options',
    queryParams: { storeId, shippingType },
  }),
  getSavedCardList: (userId, paymentProvider) => ({
    url: `/api/consumers/${userId}/paymentMethods`,
    queryParams: { provider: paymentProvider },
  }),
};

export const createPaymentDetails = ({ orderId, orderSource, paymentProvider, webhookURL }) =>
  post('/payment', { receiptNumber: orderId, orderSource, paymentProvider, webhookURL });

// API Doc: https://app.swaggerhub.com/apis/Storehub/beep-bff-qr-ordering-API/1.0.1#/payment/post_payment_init
export const initPayment = data => post('/payment/init', data);

// API for submit order and initPayment of pay later
export const initPayLaterOrderPayment = data => post('/payment/init-with-order', data);
