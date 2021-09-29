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
