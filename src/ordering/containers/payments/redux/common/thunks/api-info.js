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

// confirm to pay for order
export const postOrderSubmitted = ({ receiptNumber, modifiedTime }) => {
  const payload = { modifiedTime };

  return post(`/api/v3/transactions/${receiptNumber}/submission`, payload);
};

// API Doc: https://app.swaggerhub.com/apis/Storehub/beep-bff-qr-ordering-API/1.0.1#/payment/post_payment_init
export const initPayment = data => post('/payment/init', data);
