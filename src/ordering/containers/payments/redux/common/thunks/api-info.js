import { post } from '../../../../../../utils/api/api-fetch';

export const API_INFO = {
  getPayments: () => ({
    url: '/payment/online/options',
  }),
  getSavedCardList: (userId, paymentProvider) => ({
    url: `/api/consumers/${userId}/paymentMethods`,
    queryParams: { provider: paymentProvider },
  }),
};

export const createPaymentDetails = ({ orderId, orderSource, isInternal = false, paymentProvider, webhookURL }) =>
  post('/payment', { receiptNumber: orderId, orderSource, isInternal, paymentProvider, webhookURL });
