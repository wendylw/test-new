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
